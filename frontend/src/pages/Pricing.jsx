import React from "react";
import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";
import { toast } from "react-toastify";
import { auth, db } from "../firebase";
import { doc, updateDoc, getDoc } from "firebase/firestore";

const includes = [
  "Every career match, with the reasons behind it",
  "A summary of your strengths and work style",
  "A PDF download, also saved to your account",
];

const Pricing = () => {
  const navigate = useNavigate();

  const handlePayment = async () => {
    const user = auth.currentUser;

    if (!user) {
      toast.info("Sign in to continue.");
      navigate("/login");
      return;
    }

    try {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        toast.error("We couldn't find your account. Sign out and sign in again.");
        return;
      }

      // Simulate payment success
      await updateDoc(userRef, {
        isPremium: true,
      });
      toast.success("Payment confirmed. Opening your report...");
      navigate("/result");
    } catch (error) {
      console.error("Error updating premium status:", error);
      toast.error("Payment didn't go through. Please try again.");
    }
  };

  return (
    <main className="bg-surface px-4 py-12 sm:px-6 sm:py-16">
      <div className="card-shadow mx-auto grid max-w-5xl overflow-hidden rounded-[2rem] bg-white md:grid-cols-2">
        <div className="flex items-end justify-center bg-gradient-to-br from-[#FFF4EA] to-[#FFDFC6] px-6 pt-10">
          <img
            src="/images/cta-group.webp"
            alt="Five young professionals smiling together"
            width="900"
            height="628"
            className="block h-auto w-full max-w-md"
          />
        </div>

        <div className="p-8 sm:p-12">
          <h1 className="text-[clamp(1.9rem,4vw,2.6rem)] font-extrabold leading-[1.08] tracking-[-0.03em] text-ink">
            Unlock your full career report
          </h1>
          <p className="mt-3 leading-relaxed text-ink-soft">
            Your quiz answers, turned into a complete written report you can download and keep.
          </p>

          <p className="mt-8 flex items-baseline gap-2">
            <span className="text-5xl font-extrabold tracking-tight text-ink">$2</span>
            <span className="text-ink-soft">one-time payment</span>
          </p>

          <ul className="mt-7 space-y-3.5">
            {includes.map((item) => (
              <li key={item} className="flex items-start gap-3 text-ink">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-bright">
                  <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} aria-hidden="true" />
                </span>
                {item}
              </li>
            ))}
          </ul>

          <button onClick={handlePayment} className="btn-primary mt-9 w-full py-3.5">
            Pay $2 and get my report
          </button>
          <button
            onClick={() => navigate("/")}
            className="mt-4 w-full text-center text-sm font-semibold text-ink-soft hover:text-ink"
          >
            Back to home
          </button>
        </div>
      </div>
    </main>
  );
};

export default Pricing;
