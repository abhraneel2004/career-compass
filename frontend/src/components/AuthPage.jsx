import React, { useEffect, useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
} from 'firebase/auth';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Check, Eye, EyeOff, LoaderCircle } from 'lucide-react';
import { auth, db, provider } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useAuthState } from '../hooks/useAuth';

const loginValidationSchema = Yup.object({
  email: Yup.string().email('Enter a valid email address').required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

const signUpValidationSchema = Yup.object({
  email: Yup.string().email('Enter a valid email address').required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm your password'),
});

// Firebase error codes, in words people can act on
const authMessages = {
  'auth/invalid-credential': 'That email and password don’t match. Check them and try again.',
  'auth/wrong-password': 'That email and password don’t match. Check them and try again.',
  'auth/user-not-found': 'There’s no account with that email. Sign up instead?',
  'auth/email-already-in-use': 'There’s already an account with that email. Log in instead.',
  'auth/weak-password': 'Choose a stronger password, at least 6 characters.',
  'auth/too-many-requests': 'Too many attempts. Wait a minute, then try again.',
  'auth/network-request-failed': 'You seem to be offline. Check your connection and try again.',
  'auth/popup-blocked': 'Your browser blocked the Google window. Allow pop-ups for this site and try again.',
};
const authMessage = (error) => authMessages[error?.code] || 'Something went wrong. Please try again.';
const isDismissed = (error) => ['auth/popup-closed-by-user', 'auth/cancelled-popup-request'].includes(error?.code);

const perks = [
  'A 60-question career quiz with eight guides',
  'Your career report, saved to your profile',
  'A resume builder and job keyword matcher',
];

const GoogleMark = () => (
  <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden="true">
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
    <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
    <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
  </svg>
);

const PasswordField = ({ name, label, autoComplete, visible, onToggle, errors, touched }) => (
  <div>
    <label htmlFor={name} className="field-label">{label}</label>
    <div className="relative">
      <Field
        id={name}
        name={name}
        type={visible ? 'text' : 'password'}
        autoComplete={autoComplete}
        aria-invalid={Boolean(touched[name] && errors[name])}
        aria-describedby={touched[name] && errors[name] ? `${name}-error` : undefined}
        className={`field pr-12 ${touched[name] && errors[name] ? 'border-red-400' : ''}`}
      />
      <button
        type="button"
        onClick={onToggle}
        aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
        className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-xl text-ink-soft hover:text-ink"
      >
        {visible ? <EyeOff className="h-4.5 w-4.5" aria-hidden="true" /> : <Eye className="h-4.5 w-4.5" aria-hidden="true" />}
      </button>
    </div>
    <ErrorMessage name={name} component="p" id={`${name}-error`} className="mt-1.5 text-sm text-red-600" />
  </div>
);

export default function AuthPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, ready } = useAuthState();
  const [isLogin, setIsLogin] = useState(location.state?.mode !== 'signup');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const [googleBusy, setGoogleBusy] = useState(false);

  // The navbar's "Sign up" and "Log in" links can switch mode while this page is open
  useEffect(() => {
    if (location.state?.mode) setIsLogin(location.state.mode !== 'signup');
  }, [location.state]);

  // Already signed in: nothing to do here
  useEffect(() => {
    if (ready && user) navigate('/', { replace: true });
  }, [ready, user, navigate]);

  const switchMode = (login) => {
    setIsLogin(login);
    setFormError('');
  };

  const handleAuth = async (values, { setSubmitting }) => {
    setFormError('');
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, values.email, values.password);
        toast.success('Welcome back!');
      } else {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          values.email,
          values.password
        );
        const user = userCredential.user;

        await setDoc(doc(db, 'users', user.uid), {
          isPremium: false,
          email: values.email,
          createdAt: new Date(),
        });
        toast.success('Your account is ready.');
      }
      navigate('/');
    } catch (error) {
      setFormError(authMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setFormError('');
    setGoogleBusy(true);
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Create the user document on first Google login only, so an
      // existing premium user isn't reset to isPremium: false
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          isPremium: false,
          email: user.email,
          createdAt: new Date(),
        });
      }
      toast.success(`Welcome${user.displayName ? `, ${user.displayName.split(' ')[0]}` : ''}!`);
      navigate('/');
    } catch (error) {
      if (!isDismissed(error)) setFormError(authMessage(error));
    } finally {
      setGoogleBusy(false);
    }
  };

  const handleForgotPassword = async (email) => {
    setFormError('');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || '')) {
      setFormError('Enter your email above, then choose “Forgot password?” again.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success(`If there’s an account for ${email}, a reset link is on its way.`);
    } catch (error) {
      setFormError(authMessage(error));
    }
  };

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-surface px-4 py-8 sm:px-6 sm:py-14">
      <div className="card-shadow mx-auto grid max-w-5xl overflow-hidden rounded-[2rem] bg-white md:grid-cols-[0.95fr_1.05fr]">
        <aside className="relative flex flex-col bg-gradient-to-br from-[#FFF4EA] to-[#FFDFC6] px-7 py-7 sm:px-10 md:pb-0 md:pt-10">
          <p className="text-sm font-semibold text-accent">{isLogin ? 'Good to see you again' : 'Free to join'}</p>
          <h2 className="mt-1.5 text-[clamp(1.6rem,3vw,2.2rem)] font-extrabold leading-[1.1] tracking-[-0.03em] text-ink">
            {isLogin ? 'Pick up where you left off' : 'Find the career that fits who you are'}
          </h2>
          <ul className="mt-6 hidden space-y-3 md:block">
            {perks.map((perk) => (
              <li key={perk} className="flex items-start gap-3 text-[15px] text-ink">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-bright">
                  <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} aria-hidden="true" />
                </span>
                {perk}
              </li>
            ))}
          </ul>
          <img
            src="/images/hero-group.webp"
            alt="A group of students and young professionals standing together"
            width="1400"
            height="1049"
            className="mt-auto hidden h-auto w-full max-w-md self-center pt-6 md:block"
          />
        </aside>

        <section className="p-7 sm:p-10 lg:p-12">
          <div role="tablist" aria-label="Account" className="grid grid-cols-2 gap-1 rounded-full bg-surface p-1">
            {[
              { login: true, label: 'Log in' },
              { login: false, label: 'Sign up' },
            ].map((tab) => (
              <button
                key={tab.label}
                role="tab"
                aria-selected={isLogin === tab.login}
                onClick={() => switchMode(tab.login)}
                className={`rounded-full py-2.5 text-sm font-semibold transition-colors ${
                  isLogin === tab.login ? 'bg-white text-ink shadow-sm' : 'text-ink-soft hover:text-ink'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <h1 className="mt-8 text-[clamp(1.6rem,3vw,2rem)] font-extrabold tracking-tight text-ink">
            {isLogin ? 'Log in to Career Compass' : 'Create your account'}
          </h1>
          <p className="mt-1.5 text-ink-soft">
            {isLogin ? 'Your report, resume and quiz progress are waiting.' : 'It takes less than a minute.'}
          </p>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={googleBusy}
            className="btn-outline mt-7 w-full border-line py-3 disabled:opacity-70"
          >
            {googleBusy ? (
              <LoaderCircle className="h-5 w-5 animate-spin motion-reduce:animate-none" aria-hidden="true" />
            ) : (
              <GoogleMark />
            )}
            Continue with Google
          </button>

          <div className="my-6 flex items-center gap-4 text-sm text-ink-soft" aria-hidden="true">
            <span className="h-px flex-1 bg-line" />
            or use your email
            <span className="h-px flex-1 bg-line" />
          </div>

          <Formik
            key={isLogin ? 'login' : 'signup'}
            initialValues={{ email: '', password: '', confirmPassword: '' }}
            validationSchema={isLogin ? loginValidationSchema : signUpValidationSchema}
            onSubmit={handleAuth}
          >
            {({ isSubmitting, errors, touched, values }) => (
              <Form noValidate className="space-y-4">
                <div>
                  <label htmlFor="email" className="field-label">Email</label>
                  <Field
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    aria-invalid={Boolean(touched.email && errors.email)}
                    aria-describedby={touched.email && errors.email ? 'email-error' : undefined}
                    className={`field ${touched.email && errors.email ? 'border-red-400' : ''}`}
                  />
                  <ErrorMessage name="email" component="p" id="email-error" className="mt-1.5 text-sm text-red-600" />
                </div>

                <PasswordField
                  name="password"
                  label="Password"
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  visible={showPassword}
                  onToggle={() => setShowPassword(!showPassword)}
                  errors={errors}
                  touched={touched}
                />

                {!isLogin && (
                  <PasswordField
                    name="confirmPassword"
                    label="Confirm password"
                    autoComplete="new-password"
                    visible={showConfirmPassword}
                    onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
                    errors={errors}
                    touched={touched}
                  />
                )}

                {isLogin && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleForgotPassword(values.email)}
                      className="text-sm font-semibold text-accent hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                {formError && (
                  <p role="alert" className="rounded-xl bg-rose px-4 py-3 text-sm font-medium text-ink">
                    {formError}
                  </p>
                )}

                <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-3 disabled:opacity-70">
                  {isSubmitting && <LoaderCircle className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />}
                  {isLogin ? 'Log in' : 'Create account'}
                </button>
              </Form>
            )}
          </Formik>

          <p className="mt-6 text-center text-sm text-ink-soft">
            {isLogin ? 'New to Career Compass?' : 'Already have an account?'}{' '}
            <button onClick={() => switchMode(!isLogin)} className="font-semibold text-accent hover:underline">
              {isLogin ? 'Create an account' : 'Log in'}
            </button>
          </p>
        </section>
      </div>
    </main>
  );
}
