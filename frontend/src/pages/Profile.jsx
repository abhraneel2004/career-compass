import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { signOut } from "firebase/auth";
import { toast } from "react-toastify";
import { CalendarClock, Download, FileText, LogOut, Pencil, ScrollText } from "lucide-react";
import { auth } from "../firebase";
import { useAuthState } from "../hooks/useAuth";
import { daysUntil, loadReports, nextQuizDate, QUIZ_COOLDOWN_DAYS } from "../lib/reports";
import { firstName, formatDate } from "../lib/report";
import { guideOrder, guides } from "../data/guides";
import ReportView, { GuideAvatar } from "../components/report/ReportView";
import DownloadReportButton from "../components/report/DownloadReportButton";
import ResumeDocument from "../components/resume/ResumeDocument";
import { downloadResumePdf, loadResume, resumeStrength } from "../lib/resume";

const shortDate = (date) => date.toLocaleDateString("en", { day: "numeric", month: "short", year: "numeric" });

const QuizStatus = ({ nextDate, onTakeQuiz }) => {
  if (!nextDate) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-peach p-5">
        <div>
          <p className="font-bold text-ink">The career quiz is open</p>
          <p className="mt-0.5 text-sm text-ink-soft">
            You can take it once every {QUIZ_COOLDOWN_DAYS} days. It takes about 10 minutes.
          </p>
        </div>
        <button onClick={onTakeQuiz} className="btn-primary px-6 py-3">
          Take the career quiz
        </button>
      </div>
    );
  }

  const days = daysUntil(nextDate);
  const elapsed = Math.min(1, Math.max(0, (QUIZ_COOLDOWN_DAYS - days) / QUIZ_COOLDOWN_DAYS));
  return (
    <div className="rounded-2xl bg-surface p-5">
      <div className="flex items-start gap-3">
        <CalendarClock className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p className="font-bold text-ink">
            Next quiz unlocks on {formatDate(nextDate)}
            <span className="font-medium text-ink-soft"> · in {days} {days === 1 ? "day" : "days"}</span>
          </p>
          <p className="mt-0.5 text-sm text-ink-soft">
            One quiz every {QUIZ_COOLDOWN_DAYS} days, so a retake shows real change rather than a second guess.
          </p>
          <div className="mt-3 h-2 rounded-full bg-white" aria-hidden="true">
            <div className="h-2 rounded-full bg-accent-bright" style={{ width: `${elapsed * 100}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
};

const ResumeTab = ({ resume, onEdit }) => {
  if (!resume) {
    return (
      <section className="card-shadow grid overflow-hidden rounded-3xl bg-white md:grid-cols-[0.8fr_1.2fr]">
        <div className="flex items-end justify-center bg-sky px-6 pt-8">
          <img src="/images/scene-resume.webp" alt="" className="block h-auto w-full max-w-xs" />
        </div>
        <div className="p-8 sm:p-10">
          <h2 className="text-2xl font-extrabold tracking-tight text-ink">No resume yet</h2>
          <p className="mt-2 max-w-md leading-relaxed text-ink-soft">
            Build one step by step with your guides. Once you preview it, it's saved here so you can download or
            edit it any time.
          </p>
          <button onClick={onEdit} className="btn-primary mt-7 px-6 py-3">
            Build your resume
          </button>
        </div>
      </section>
    );
  }

  const { score, level } = resumeStrength(resume);
  return (
    <>
      <section className="card-shadow flex flex-wrap items-center justify-between gap-5 rounded-3xl bg-white p-6 sm:p-8">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-accent">
            Your resume{resume.updatedAt ? ` · Updated ${formatDate(resume.updatedAt)}` : ""}
          </p>
          <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">{resume.values.name || "Untitled resume"}</h2>
          <div className="mt-3 flex max-w-sm items-center gap-3">
            <div className="h-2 flex-1 rounded-full bg-surface" aria-hidden="true">
              <div className="h-2 rounded-full bg-accent-bright" style={{ width: `${score}%` }} />
            </div>
            <span className="text-sm font-semibold text-ink-soft">
              <span className="font-extrabold text-ink">{score}</span>/100 · {level.name}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => downloadResumePdf(resume)} className="btn-primary px-6 py-3">
            <Download className="h-4 w-4" aria-hidden="true" />
            Download PDF
          </button>
          <button onClick={onEdit} className="btn-outline px-6 py-3">
            <Pencil className="h-4 w-4" aria-hidden="true" />
            Edit resume
          </button>
        </div>
      </section>
      <ResumeDocument resume={resume} />
    </>
  );
};

const tabs = [
  { id: "report", label: "Career report", icon: ScrollText },
  { id: "resume", label: "Resume", icon: FileText },
];

const Profile = () => {
  const navigate = useNavigate();
  const { user, ready } = useAuthState();
  const [data, setData] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [error, setError] = useState(false);
  const [resume, setResume] = useState(undefined);
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get("tab") === "resume" ? "resume" : "report";

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      toast.info("Sign in to see your profile.");
      navigate("/login");
      return;
    }
    let cancelled = false;
    loadResume(user.uid)
      .then((saved) => !cancelled && setResume(saved))
      .catch((err) => {
        console.error("Couldn't load the saved resume:", err);
        if (!cancelled) setResume(null);
      });
    loadReports(user.uid)
      .then((result) => {
        if (cancelled) return;
        setData(result);
        setSelectedId(result.reports[0]?.id ?? null);
      })
      .catch((err) => {
        console.error("Couldn't load saved reports:", err);
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [ready, user, navigate]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (err) {
      toast.error(`Couldn't log out: ${err.message}`);
    }
  };

  if (!ready || !user) return <main className="min-h-[calc(100vh-4rem)] bg-surface" />;

  const name = firstName(user);
  const reports = data?.reports || [];
  const selected = reports.find((r) => r.id === selectedId) || reports[0];
  const nextDate = nextQuizDate(data?.lastReportAt);
  const initial = (user.displayName || user.email || "?").trim()[0].toUpperCase();

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-surface px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-5xl space-y-4">
        <section className="card-shadow rounded-3xl bg-white p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-4">
              {user.photoURL ? (
                <img src={user.photoURL} alt="" referrerPolicy="no-referrer" className="h-16 w-16 rounded-full object-cover" />
              ) : (
                <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-peach text-2xl font-extrabold text-accent">
                  {initial}
                </span>
              )}
              <div className="min-w-0">
                <p className="text-sm font-semibold text-accent">Your profile</p>
                <h1 className="truncate text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
                  {user.displayName || name || "Welcome"}
                </h1>
                <p className="truncate text-sm text-ink-soft">{user.email}</p>
              </div>
            </div>
            <button onClick={handleLogout} className="btn-outline px-4 py-2 text-sm">
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Log out
            </button>
          </div>

          {data && (
            <div className="mt-6">
              <QuizStatus nextDate={nextDate} onTakeQuiz={() => navigate("/quiz")} />
            </div>
          )}
        </section>

        <nav aria-label="Profile sections" className="flex gap-1.5 rounded-full bg-white p-1.5 card-shadow sm:inline-flex">
          {tabs.map(({ id, label, icon }) => {
            const Icon = icon;
            return (
              <button
                key={id}
                onClick={() => setSearchParams(id === "report" ? {} : { tab: id }, { replace: true })}
                aria-current={tab === id ? "page" : undefined}
                className={`inline-flex flex-1 items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors sm:flex-none ${
                  tab === id ? "bg-ink text-white" : "text-ink-soft hover:bg-surface hover:text-ink"
                }`}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {label}
              </button>
            );
          })}
        </nav>

        {tab === "resume" &&
          (resume === undefined ? (
            <p className="card-shadow rounded-3xl bg-white p-10 text-center text-ink-soft" role="status">
              Loading your resume...
            </p>
          ) : (
            <ResumeTab resume={resume} onEdit={() => navigate("/resume-generation")} />
          ))}

        {tab === "report" && !data && !error && (
          <p className="card-shadow rounded-3xl bg-white p-10 text-center text-ink-soft" role="status">
            Loading your career reports...
          </p>
        )}

        {tab === "report" && error && (
          <p className="card-shadow rounded-3xl bg-white p-10 text-center text-ink-soft" role="alert">
            We couldn't load your saved reports. Check your connection and refresh the page.
          </p>
        )}

        {tab === "report" && data && reports.length === 0 && (
          <section className="card-shadow rounded-3xl bg-white p-8 text-center sm:p-12">
            <div className="flex justify-center -space-x-2">
              {guideOrder.map((id) => (
                <GuideAvatar key={id} guide={guides[id]} className="h-11 w-11" />
              ))}
            </div>
            <h2 className="mt-6 text-2xl font-extrabold tracking-tight text-ink">No career report yet</h2>
            <p className="mx-auto mt-2 max-w-md text-ink-soft">
              Answer 60 questions with your guides and get a report of the careers that fit you. It's saved here
              so you can come back to it any time.
            </p>
          </section>
        )}

        {tab === "report" && selected && (
          <>
            {reports.length > 1 && (
              <nav aria-label="Saved reports" className="flex flex-wrap items-center gap-2">
                <span className="mr-1 text-sm font-semibold text-ink-soft">Your reports</span>
                {reports.map((r, index) => (
                  <button
                    key={r.id}
                    onClick={() => setSelectedId(r.id)}
                    aria-current={r.id === selected.id ? "true" : undefined}
                    className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${
                      r.id === selected.id ? "bg-ink text-white" : "bg-white text-ink hover:bg-line"
                    }`}
                  >
                    {r.createdAt ? shortDate(r.createdAt) : `Report ${reports.length - index}`}
                  </button>
                ))}
              </nav>
            )}
            <ReportView
              report={selected.report}
              name={name}
              createdAt={selected.createdAt}
              workStyles={selected.workStyles}
              actions={<DownloadReportButton user={user} entry={selected} name={name} />}
            />
          </>
        )}
      </div>
    </main>
  );
};

export default Profile;
