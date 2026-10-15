import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { ArrowLeft, Award, CalendarClock, Check, Cloud, CloudOff, Coffee, HardDrive, LoaderCircle, RotateCcw, Zap } from "lucide-react";
import { API_BASE_URL } from "../config";
import { useAuthState } from "../hooks/useAuth";
import {
  clearProgress,
  loadLocalProgress,
  loadRemoteProgress,
  makeProgress,
  pickNewest,
  sanitizeAnswers,
  saveLocalProgress,
  saveRemoteProgress,
} from "../lib/quizProgress";
import { daysUntil, loadReports, nextQuizDate, QUIZ_COOLDOWN_DAYS } from "../lib/reports";
import { formatDate, normalizeReport, parseMarkdownReport } from "../lib/report";
import {
  checkpoints,
  FINAL_TROPHY,
  guideOrder,
  guides,
  questionGuides,
  reactions,
  XP_PER_ANSWER,
  XP_PER_CHECKPOINT,
} from "../data/guides";

const interestQuestions = [
  // Checkpoint 1: How you think
  { question: "I prefer working independently rather than in a team.", short: "Prefer independent work." },
  { question: "I thrive in structured and organized environments.", short: "Prefer structured environments." },
  { question: "I am comfortable taking risks in my career decisions.", short: "Comfortable with career risks." },
  { question: "I often rely on logic rather than emotions when making decisions.", short: "Logical decision-maker." },
  { question: "I feel energized when engaging in creative or abstract thinking.", short: "Enjoy creative thinking." },
  { question: "I prefer deep, focused work rather than handling multiple tasks at once.", short: "Prefer deep focus over multitasking." },
  { question: "I am highly adaptable and can easily switch between different tasks.", short: "Highly adaptable." },
  { question: "I prefer planning everything in advance rather than going with the flow.", short: "Prefer advance planning." },
  { question: "I can manage my time effectively and meet deadlines consistently.", short: "Strong time management." },
  { question: "I am skilled at generating innovative solutions to problems.", short: "Good at problem-solving." },
  // Checkpoint 2: Where you work best
  { question: "I enjoy working in predictable and routine-based environments.", short: "Prefer routine work." },
  { question: "I enjoy working in high-pressure, fast-paced environments.", short: "Enjoy high-pressure environments." },
  { question: "I prefer jobs that require frequent travel.", short: "Prefer jobs with travel." },
  { question: "I enjoy working in an office rather than remotely.", short: "Prefer office work." },
  { question: "I prefer jobs with flexible working hours over strict 9-to-5 schedules.", short: "Prefer flexible hours." },
  { question: "I feel comfortable working in hierarchical, corporate structures.", short: "Comfortable in corporate structures." },
  { question: "I would enjoy working in startups or entrepreneurial ventures.", short: "Interested in startups." },
  { question: "I value job security over the excitement of unpredictable opportunities.", short: "Prefer job security." },
  { question: "I prefer a career where I can work outdoors rather than indoors.", short: "Prefer outdoor work." },
  { question: "I would enjoy a job that requires hands-on physical work.", short: "Enjoy hands-on work." },
  // Checkpoint 3: How you work with people
  { question: "I enjoy interacting with new people and networking.", short: "Enjoy networking." },
  { question: "I thrive in collaborative environments where teamwork is key.", short: "Enjoy teamwork." },
  { question: "I am passionate about psychology and understanding human behavior.", short: "Passionate about psychology." },
  { question: "I am good at persuading and negotiating with others.", short: "Skilled in negotiation." },
  { question: "I am skilled at resolving conflicts in professional settings.", short: "Good at conflict resolution." },
  { question: "I have excellent leadership and team management abilities.", short: "Strong leadership skills." },
  { question: "I am great at actively listening and understanding different perspectives.", short: "Good at active listening." },
  { question: "I enjoy mentoring or teaching others.", short: "Enjoy mentoring/teaching." },
  { question: "I can maintain composure and make sound decisions under pressure.", short: "Calm under pressure." },
  { question: "I have strong emotional intelligence and can manage relationships well.", short: "Strong emotional intelligence." },
  // Checkpoint 4: What you're good at
  { question: "I enjoy programming and problem-solving in software development.", short: "Enjoy programming." },
  { question: "I have strong numerical and analytical abilities.", short: "Strong numerical skills." },
  { question: "I am skilled at designing and creating artistic or visual content.", short: "Skilled in artistic design." },
  { question: "I have a knack for writing and communication.", short: "Strong writing skills." },
  { question: "I enjoy working with mechanical or electrical systems.", short: "Interested in mechanical/electrical work." },
  { question: "I am proficient in using data analysis tools and methodologies.", short: "Proficient in data analysis." },
  { question: "I can troubleshoot and resolve technical issues efficiently.", short: "Good at troubleshooting." },
  { question: "I am skilled at conducting research and synthesizing findings.", short: "Skilled in research." },
  { question: "I can create compelling marketing and branding strategies.", short: "Skilled in marketing strategies." },
  { question: "I have experience with project management tools and methodologies.", short: "Experienced in project management." },
  // Checkpoint 5: Fields that interest you
  { question: "I am interested in working in healthcare and medicine.", short: "Interested in healthcare." },
  { question: "I am passionate about finance, economics, and investment strategies.", short: "Passionate about finance." },
  { question: "I am drawn to the technology industry (coding, AI, cybersecurity, etc.).", short: "Interested in tech." },
  { question: "I am interested in working in media and entertainment (film, music, writing).", short: "Interested in media." },
  { question: "I enjoy designing physical products, spaces, or user experiences.", short: "Enjoy designing products/spaces." },
  { question: "I would enjoy working in marketing, advertising, or sales.", short: "Interested in marketing." },
  { question: "I would enjoy working in data science, statistics, or analytics.", short: "Interested in data science." },
  { question: "I am interested in business strategy, consulting, and corporate leadership.", short: "Interested in business strategy." },
  { question: "I would love to work in hospitality, travel, and tourism.", short: "Interested in hospitality." },
  { question: "I enjoy working in engineering and developing technical solutions.", short: "Interested in engineering." },
  // Checkpoint 6: What matters to you
  { question: "I would love to work in the education sector (teaching, research, mentoring).", short: "Interested in education." },
  { question: "I would be happy working in the government or public sector.", short: "Interested in public sector." },
  { question: "I would prefer working in the legal industry (law, policy, justice).", short: "Interested in law." },
  { question: "I am interested in environmental science and sustainability.", short: "Interested in sustainability." },
  { question: "I prioritize having a high salary over job satisfaction.", short: "Prioritize high salary." },
  { question: "I want a career that allows me to make a meaningful impact on society.", short: "Seek meaningful impact." },
  { question: "I value continuous learning and professional growth.", short: "Value continuous learning." },
  { question: "I prefer a job that offers a work-life balance over career advancement.", short: "Prioritize work-life balance." },
  { question: "I want a career that allows me to be highly creative and innovative.", short: "Prefer creative career." },
  { question: "I prioritize working in an industry that aligns with my personal values.", short: "Prefer value-aligned work." },
];

const workStyleOptions = [
  "Independent",
  "Analytical",
  "Outgoing",
  "Methodical",
  "Decisive",
  "Curious",
  "Practical",
  "Observant",
  "Visionary",
  "Structured",
  "Adaptable",
  "Social",
  "Introverted",
  "Logical",
  "Empathetic",
  "Multitasker",
  "Leader",
  "Direct",
  "Competitive",
  "Collaborative",
];

const options = [
  "Strongly Disagree",
  "Disagree",
  "Neutral",
  "Agree",
  "Strongly Agree",
];

// Bigger circles at the ends, like a "how much do you agree" dial
const scale = [
  { value: 1, size: "h-14 w-14", tone: "border-ink/45", fill: "bg-ink" },
  { value: 2, size: "h-11 w-11", tone: "border-ink/45", fill: "bg-ink" },
  { value: 3, size: "h-9 w-9", tone: "border-ink-soft/40", fill: "bg-ink-soft" },
  { value: 4, size: "h-11 w-11", tone: "border-accent-bright", fill: "bg-accent-bright" },
  { value: 5, size: "h-14 w-14", tone: "border-accent-bright", fill: "bg-accent-bright" },
];

const GuideFace = ({ id, className = "h-10 w-10" }) => (
  <img
    src={guides[id].image}
    alt={guides[id].name}
    className={`${className} rounded-full object-cover object-top ring-2 ring-white ${guides[id].tone}`}
  />
);

const mapStops = [...checkpoints, { title: "Final round", badge: "Career report", image: FINAL_TROPHY }];

// Badge track: earned badges in colour, the current one raised, locked ones greyed out
const CheckpointMap = ({ current, completed, progress }) => (
  <ol className="relative flex items-center justify-between [--inset:1.25rem]" aria-label="Quiz checkpoints">
    <span
      aria-hidden="true"
      className="absolute left-[var(--inset)] right-[var(--inset)] top-1/2 h-1 -translate-y-1/2 rounded-full bg-surface"
    />
    <span
      aria-hidden="true"
      className="absolute left-[var(--inset)] top-1/2 h-1 -translate-y-1/2 rounded-full bg-accent-bright transition-[width] duration-500 motion-reduce:transition-none"
      style={{ width: `calc((100% - 2 * var(--inset)) * ${progress})` }}
    />
    {mapStops.map((stop, index) => {
      const isDone = index < checkpoints.length && completed[index];
      const isCurrent = index === current;
      const isLocked = !isDone && !isCurrent;
      return (
        <li
          key={stop.title}
          title={stop.title}
          className={`relative flex h-10 w-10 items-center justify-center rounded-full bg-white ${
            isCurrent ? "ring-4 ring-accent-bright/25" : ""
          }`}
        >
          <img
            src={stop.image}
            alt=""
            className={`h-full w-full object-contain transition duration-300 ${isLocked ? "opacity-35 grayscale" : ""} ${
              isCurrent ? "scale-110" : ""
            }`}
          />
          {isDone && (
            <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#2F9E78] ring-2 ring-white">
              <Check className="h-2.5 w-2.5 text-white" strokeWidth={4} aria-hidden="true" />
            </span>
          )}
          <span className="sr-only">
            {stop.title}: {isDone ? "complete" : isCurrent ? "current" : "locked"}
          </span>
        </li>
      );
    })}
  </ol>
);

const saveStates = {
  saving: { icon: LoaderCircle, label: "Saving...", spin: true },
  saved: { icon: Cloud, label: "Progress saved" },
  device: { icon: HardDrive, label: "Saved on this device" },
  error: { icon: CloudOff, label: "Not saved" },
};

const SaveIndicator = ({ status, signedIn }) => {
  const state = saveStates[status];
  if (!state) return null;
  const Icon = state.icon;
  return (
    <span
      role="status"
      title={status === "device" && !signedIn ? "Sign in to continue on another device" : undefined}
      className="inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 text-ink-soft"
    >
      <Icon className={`h-4 w-4 ${state.spin ? "animate-spin motion-reduce:animate-none" : ""}`} aria-hidden="true" />
      {state.label}
    </span>
  );
};

const firstUnanswered = (answers) => {
  const index = interestQuestions.findIndex((q) => answers[q.short] === undefined);
  return index === -1 ? interestQuestions.length : index;
};

const timeAgo = (timestamp) => {
  const minutes = Math.round((Date.now() - timestamp) / 60000);
  const format = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  if (minutes < 60) return format.format(-Math.max(minutes, 0), "minute");
  if (minutes < 60 * 24) return format.format(-Math.round(minutes / 60), "hour");
  return format.format(-Math.round(minutes / (60 * 24)), "day");
};

// Pushes progress to Firestore and reports the result
const syncProgress = async (uid, progress, setSaveStatus) => {
  try {
    await saveRemoteProgress(uid, progress);
    setSaveStatus("saved");
  } catch (error) {
    console.error("Couldn't sync quiz progress:", error);
    setSaveStatus("device");
  }
};

const Interest = () => {
  const [page, setPage] = useState(0);
  const [answers, setAnswers] = useState({});
  const [reaction, setReaction] = useState(null);
  const [checkpointBreak, setCheckpointBreak] = useState(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const advanceTimer = useRef(null);

  // Saved progress: offered on return, then written on every change
  const { user, ready: authReady } = useAuthState();
  const uid = user?.uid || null;
  const [resumeOffer, setResumeOffer] = useState(null);
  const [hydrated, setHydrated] = useState(false);
  const [saveStatus, setSaveStatus] = useState("idle");
  const [lockedUntil, setLockedUntil] = useState(null);
  const remoteTimer = useRef(null);
  const latest = useRef({ uid, answers, hydrated });
  const wasAway = useRef(false);

  const MAX_WORK_STYLES = 5;
  const isFinalRound = page >= interestQuestions.length;
  const selectedStyles = answers.workStyles || [];

  const answeredCount = Object.keys(answers).filter((key) => key !== "workStyles").length;
  const completed = checkpoints.map((checkpoint) =>
    interestQuestions.slice(checkpoint.start, checkpoint.end).every((q) => answers[q.short] !== undefined)
  );
  const badgesEarned = completed.filter(Boolean).length;
  const xp = answeredCount * XP_PER_ANSWER + badgesEarned * XP_PER_CHECKPOINT;
  const currentCheckpoint = isFinalRound
    ? checkpoints.length
    : checkpoints.findIndex((checkpoint) => page >= checkpoint.start && page < checkpoint.end);

  useEffect(() => () => {
    clearTimeout(advanceTimer.current);
    clearTimeout(remoteTimer.current);
  }, []);

  useEffect(() => {
    latest.current = { uid, answers, hydrated };
  });

  // Each screen change (checkpoint reward, resume, final round) starts from the top
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [checkpointBreak, hydrated, isFinalRound]);

  // Once we know who the user is, check they can take the quiz this month,
  // then look for progress on this device and in their account
  useEffect(() => {
    if (!authReady || hydrated) return;
    if (!uid) {
      toast.info("Sign in to take the career quiz.", { toastId: "quiz-sign-in" });
      navigate("/login");
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const { lastReportAt } = await loadReports(uid);
        const nextDate = nextQuizDate(lastReportAt);
        if (nextDate) {
          if (!cancelled) setLockedUntil(nextDate);
          return;
        }
      } catch (error) {
        console.error("Couldn't check when the last quiz was taken:", error);
      }

      let remote = null;
      try {
        remote = await loadRemoteProgress(uid);
      } catch (error) {
        console.error("Couldn't load saved quiz progress:", error);
      }
      if (cancelled) return;
      const saved = pickNewest(loadLocalProgress(uid), remote);
      const clean = saved ? sanitizeAnswers(saved.answers, interestQuestions, workStyleOptions) : {};
      if (Object.keys(clean).length > 0) {
        setResumeOffer({ answers: clean, updatedAt: saved.updatedAt });
      } else {
        setHydrated(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authReady, uid, hydrated, navigate]);

  // Save on every change: instantly on the device, and to the account shortly after
  useEffect(() => {
    if (!hydrated || Object.keys(answers).length === 0) return;
    const progress = makeProgress(answers);
    const savedLocally = saveLocalProgress(uid, progress);
    clearTimeout(remoteTimer.current);
    if (!uid) {
      setSaveStatus(savedLocally ? "device" : "error");
      return;
    }
    setSaveStatus("saving");
    remoteTimer.current = setTimeout(() => syncProgress(uid, progress, setSaveStatus), 800);
  }, [answers, hydrated, uid]);

  // Leaving the tab saves straight away; coming back says so
  useEffect(() => {
    const originalTitle = document.title;
    const onVisibilityChange = () => {
      const current = latest.current;
      const hasProgress = current.hydrated && Object.keys(current.answers).length > 0;
      if (document.visibilityState === "hidden") {
        if (!hasProgress) return;
        const progress = makeProgress(current.answers);
        saveLocalProgress(current.uid, progress);
        if (current.uid) {
          clearTimeout(remoteTimer.current);
          syncProgress(current.uid, progress, setSaveStatus);
        }
        document.title = "Progress saved | Career Compass";
        wasAway.current = true;
      } else if (wasAway.current) {
        wasAway.current = false;
        document.title = originalTitle;
        toast.info("Welcome back! Your progress was saved while you were away.", { toastId: "progress-saved" });
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      document.title = originalTitle;
    };
  }, []);

  const resumeQuiz = () => {
    setAnswers(resumeOffer.answers);
    setPage(firstUnanswered(resumeOffer.answers));
    setResumeOffer(null);
    setHydrated(true);
  };

  const startOver = async () => {
    if (!window.confirm("Start over? Your saved answers will be cleared.")) return;
    setResumeOffer(null);
    setAnswers({});
    setPage(0);
    setSaveStatus("idle");
    setHydrated(true);
    try {
      await clearProgress(uid);
    } catch (error) {
      console.error("Couldn't clear saved quiz progress:", error);
    }
  };

  const takeBreak = async () => {
    const progress = makeProgress(answers);
    saveLocalProgress(uid, progress);
    clearTimeout(remoteTimer.current);
    if (uid) await syncProgress(uid, progress, setSaveStatus);
    toast.success("Progress saved. Pick up where you left off any time.");
    navigate("/");
  };

  const handleAnswer = (value) => {
    if (reaction || isFinalRound) return;
    const question = interestQuestions[page];
    const variants = reactions[value];

    setReaction({ value, text: variants[page % variants.length], gainedXp: answers[question.short] === undefined });
    setAnswers((prev) => ({ ...prev, [question.short]: value }));

    // Let the guide react, then move on (to a checkpoint screen if this question ends one)
    const nextPage = page + 1;
    const finishedCheckpoint = checkpoints.findIndex((checkpoint) => checkpoint.end === nextPage);
    advanceTimer.current = setTimeout(() => {
      setReaction(null);
      if (finishedCheckpoint !== -1) setCheckpointBreak(finishedCheckpoint);
      setPage(nextPage);
    }, 950);
  };

  // Number keys 1–5 answer the current question
  useEffect(() => {
    const onKeyDown = (e) => {
      if (!hydrated || checkpointBreak !== null || loading || e.target.closest?.("input, textarea")) return;
      const value = Number(e.key);
      if (value >= 1 && value <= 5) handleAnswer(value);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  const toggleStyle = (style) => {
    setAnswers((prev) => {
      const current = prev.workStyles || [];
      if (current.includes(style)) {
        return { ...prev, workStyles: current.filter((v) => v !== style) };
      } else if (current.length < MAX_WORK_STYLES) {
        return { ...prev, workStyles: [...current, style] };
      }
      return prev;
    });
  };

  const handlePrevious = () => {
    clearTimeout(advanceTimer.current);
    setReaction(null);
    setCheckpointBreak(null);
    if (page > 0) {
      setPage((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (selectedStyles.length < MAX_WORK_STYLES) {
      toast.error(`Pick ${MAX_WORK_STYLES} traits to finish.`);
      return;
    }

    const choicesString = Object.entries(answers)
      .map(([key, value]) =>
        key === "workStyles" ? `Work Styles: ${value.join(", ")}` : `${key}: ${value}`
      )
      .join(", ");

    try {
      setLoading(true);
      // The server checks the sign-in, enforces the 30-day limit and saves the report to the account
      const token = await user.getIdToken();
      const response = await axios.post(
        `${API_BASE_URL}/api/career-suggestions`,
        { choices: choicesString, workStyles: selectedStyles },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const report =
        normalizeReport(response.data.report) || parseMarkdownReport(response.data.suggestions?.content);
      if (!report) throw new Error("The report came back empty");

      const saved = Boolean(response.data.entry);
      const entry = {
        id: response.data.entry?.id || String(Date.now()),
        createdAt: response.data.entry?.createdAt ? new Date(response.data.entry.createdAt) : new Date(),
        report,
        workStyles: selectedStyles,
      };

      clearTimeout(remoteTimer.current);
      clearProgress(uid).catch((error) => console.error("Couldn't clear saved quiz progress:", error));
      navigate("/result", { state: { entry, saved } });
    } catch (error) {
      const status = error.response?.status;
      if (status === 429) {
        setLockedUntil(error.response.data?.nextQuizAt ? new Date(error.response.data.nextQuizAt) : new Date());
      } else if (status === 409) {
        toast.info("Your report is already being written. Check your profile in a minute.");
      } else if (status === 401) {
        toast.error("Your session has expired. Sign in again to get your report.");
      } else {
        console.error("Submission Error:", error);
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const renderQuestion = () => {
    const question = interestQuestions[page];
    const guideId = questionGuides[page];
    const guide = guides[guideId];
    const currentValue = answers[question.short];
    const checkpoint = checkpoints[currentCheckpoint];
    const checkpointQuestions = interestQuestions.slice(checkpoint.start, checkpoint.end);

    return (
      <div className="grid gap-4 md:grid-cols-[0.85fr_1.15fr] md:items-stretch">
        <div className={`relative flex h-44 items-end justify-center overflow-hidden rounded-3xl sm:h-64 md:h-auto md:min-h-[20rem] ${guide.tone}`}>
          <img
            key={guideId}
            src={guide.image}
            alt={`${guide.name}, ${guide.role}`}
            className="guide-in absolute bottom-0 h-[92%] w-auto max-w-none object-contain object-bottom"
          />
          <div className="absolute bottom-3 left-3 rounded-2xl bg-white/95 px-3.5 py-2 shadow-sm">
            <p className="font-bold leading-tight text-ink">{guide.name}</p>
            <p className="text-sm text-ink-soft">{guide.role}</p>
          </div>
        </div>

        <div className="card-shadow relative flex flex-col rounded-3xl bg-white p-5 sm:p-7">
          {/* Speech-bubble tail pointing at the guide */}
          <span
            aria-hidden="true"
            className="absolute -left-2 top-12 hidden h-5 w-5 rotate-45 bg-white md:block"
          />
          <div className="flex items-center justify-between gap-3 text-sm font-semibold">
            <span className="text-accent">{guide.name} asks</span>
            <span className="text-ink-soft">
              Question {page - checkpoint.start + 1} of {checkpoint.end - checkpoint.start}
            </span>
          </div>
          <div className="mt-3 flex gap-1" aria-hidden="true">
            {checkpointQuestions.map((q, i) => (
              <span
                key={q.short}
                className={`h-1.5 flex-1 rounded-full ${
                  checkpoint.start + i === page
                    ? "bg-ink"
                    : answers[q.short] !== undefined
                      ? "bg-accent-bright"
                      : "bg-surface"
                }`}
              />
            ))}
          </div>
          <p key={page} className="bubble-in mt-4 flex-1 text-[clamp(1.25rem,2.3vw,1.7rem)] font-bold leading-snug tracking-tight text-ink">
            “{question.question}”
          </p>

          <p className="mt-5 text-sm font-semibold text-ink">How true is this for you?</p>
          <div role="radiogroup" aria-label="How true is this for you?" className="mt-3 flex items-center justify-between gap-1.5">
            {scale.map((step) => {
              const isSelected = currentValue === step.value;
              return (
                <button
                  key={step.value}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  aria-label={options[step.value - 1]}
                  disabled={Boolean(reaction)}
                  onClick={() => handleAnswer(step.value)}
                  className={`${step.size} shrink-0 rounded-full border-[3px] transition-transform hover:scale-110 disabled:cursor-default disabled:hover:scale-100 motion-reduce:transition-none ${step.tone} ${isSelected ? step.fill : "bg-white"}`}
                />
              );
            })}
          </div>
          <div className="mt-2 flex justify-between text-sm font-semibold">
            <span className="text-ink">Disagree</span>
            <span className="text-accent">Agree</span>
          </div>

          <div className="mt-5 flex items-stretch gap-2.5">
            {page > 0 && (
              <button onClick={handlePrevious} aria-label="Previous question" className="btn-outline shrink-0 px-4">
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">Previous</span>
              </button>
            )}
            <div aria-live="polite" className="relative flex min-h-12 flex-1 items-center rounded-2xl bg-surface px-4 py-2.5">
              {reaction ? (
                <>
                  <p className="pop text-[15px] font-semibold text-ink">
                    {guide.name}: “{reaction.text}”
                  </p>
                  {reaction.gainedXp && (
                    <span className="xp-float absolute -top-3 right-4 rounded-full bg-accent-bright px-2.5 py-0.5 text-sm font-bold text-white">
                      +{XP_PER_ANSWER} XP
                    </span>
                  )}
                </>
              ) : (
                <p className="text-sm text-ink-soft">
                  Pick a circle<span className="hidden sm:inline">, or press 1 to 5 on your keyboard</span>.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCheckpointBreak = () => {
    const checkpoint = checkpoints[checkpointBreak];
    const next = checkpoints[checkpointBreak + 1];
    const nextGuides = next ? [...new Set(questionGuides.slice(next.start, next.end))] : guideOrder;

    return (
      <div className="card-shadow mx-auto grid max-w-3xl items-center gap-5 rounded-3xl bg-white p-6 text-center sm:p-8 md:grid-cols-[auto_1fr] md:gap-8 md:text-left">
        <div className="relative mx-auto h-28 w-28 sm:h-36 sm:w-36">
          <span
            aria-hidden="true"
            className="absolute inset-0 rounded-full bg-[radial-gradient(closest-side,#FFD9BF,transparent)] blur-md"
          />
          <img src={checkpoint.image} alt={`${checkpoint.badge} badge`} className="pop relative h-full w-full object-contain" />
        </div>

        <div>
          <p className="text-sm font-semibold text-ink-soft">
            Checkpoint {checkpointBreak + 1} of {checkpoints.length} cleared
          </p>
          <h2 className="mt-1 text-[clamp(1.4rem,2.6vw,1.9rem)] font-extrabold leading-tight tracking-tight text-ink">
            You earned the {checkpoint.badge} badge
          </h2>
          <p className="mt-1 font-semibold text-accent">+{XP_PER_CHECKPOINT} bonus XP</p>

          <div className="mt-5 flex flex-wrap items-start justify-center gap-x-8 gap-y-4 md:justify-start">
            <div>
              <p className="text-xs font-semibold text-ink-soft">Your badges</p>
              <ul className="mt-1.5 flex gap-1">
                {checkpoints.map((cp, index) => (
                  <li key={cp.title}>
                    <img
                      src={cp.image}
                      alt={`${cp.badge}${completed[index] ? "" : " (locked)"}`}
                      className={`h-8 w-8 object-contain ${completed[index] ? "" : "opacity-30 grayscale"}`}
                    />
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold text-ink-soft">{next ? `Up next: ${next.title}` : "Up next: the final round"}</p>
              <div className="mt-1.5 flex justify-center -space-x-2 md:justify-start">
                {nextGuides.map((id) => (
                  <GuideFace key={id} id={id} className="h-8 w-8" />
                ))}
              </div>
            </div>
          </div>

          <p className="mt-5 text-sm text-ink-soft">
            Need a break? Your progress is saved, so you can pick up from here any time
            {uid ? ", on any device." : " on this device."}
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-3 md:justify-start">
            <button autoFocus onClick={() => setCheckpointBreak(null)} className="btn-primary px-7 py-3">
              Continue
            </button>
            <button onClick={takeBreak} className="btn-outline px-6 py-3">
              <Coffee className="h-4 w-4" aria-hidden="true" />
              Take a break
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderResume = () => {
    const saved = resumeOffer.answers;
    const answered = Object.keys(saved).filter((key) => key !== "workStyles").length;
    const nextIndex = firstUnanswered(saved);
    const nextGuide = nextIndex < interestQuestions.length ? guides[questionGuides[nextIndex]] : null;
    const nextCheckpoint = checkpoints.find((cp) => nextIndex >= cp.start && nextIndex < cp.end);

    return (
      <div className="card-shadow grid overflow-hidden rounded-3xl bg-white md:grid-cols-[0.8fr_1.2fr]">
        <div className={`relative h-64 overflow-hidden sm:h-80 md:h-auto md:min-h-[24rem] ${nextGuide ? nextGuide.tone : "bg-peach"}`}>
          {nextGuide ? (
            <img
              src={nextGuide.image}
              alt={`${nextGuide.name}, ${nextGuide.role}`}
              className="guide-in absolute bottom-0 left-1/2 h-[92%] w-auto max-w-none -translate-x-1/2 object-contain object-bottom"
            />
          ) : (
            <img src={FINAL_TROPHY} alt="" className="pop absolute inset-0 m-auto h-40 w-40 object-contain" />
          )}
        </div>
        <div className="p-7 sm:p-10">
          <p className="text-sm font-semibold text-accent">Welcome back</p>
          <h2 className="mt-1 text-[clamp(1.6rem,3.5vw,2.2rem)] font-extrabold leading-tight tracking-tight text-ink">
            You've answered {answered} of {interestQuestions.length} questions
          </h2>
          <p className="mt-3 leading-relaxed text-ink-soft">
            Your progress was saved {timeAgo(resumeOffer.updatedAt)}.{" "}
            {nextGuide
              ? `${nextGuide.name} has your next question, in ${nextCheckpoint.title.toLowerCase()}.`
              : "Only the final round is left."}
          </p>

          <div className="mt-6 h-2 rounded-full bg-surface" aria-hidden="true">
            <div className="h-2 rounded-full bg-accent-bright" style={{ width: `${(answered / interestQuestions.length) * 100}%` }} />
          </div>
          <ul className="mt-5 flex gap-1.5 sm:gap-2.5">
            {checkpoints.map((cp) => {
              const isEarned = interestQuestions.slice(cp.start, cp.end).every((q) => saved[q.short] !== undefined);
              return (
                <li key={cp.title}>
                  <img
                    src={cp.image}
                    alt={`${cp.badge}${isEarned ? "" : " (locked)"}`}
                    className={`h-10 w-10 object-contain sm:h-12 sm:w-12 ${isEarned ? "" : "opacity-30 grayscale"}`}
                  />
                </li>
              );
            })}
          </ul>

          <div className="mt-8 flex flex-wrap gap-3">
            <button autoFocus onClick={resumeQuiz} className="btn-primary px-6 py-3">
              Continue where I left off
            </button>
            <button onClick={startOver} className="btn-outline px-6 py-3">
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Start over
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderFinalRound = () => (
    <div className="card-shadow rounded-3xl bg-white p-6 sm:p-10">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex -space-x-2">
          {guideOrder.map((id) => (
            <GuideFace key={id} id={id} />
          ))}
        </div>
        <p className="text-sm font-semibold text-ink-soft">Final round, from all your guides</p>
      </div>
      <h2 className="mt-5 text-[clamp(1.5rem,3.2vw,2.1rem)] font-extrabold tracking-tight text-ink">
        Build your trait card: pick the {MAX_WORK_STYLES} words that describe how you work
      </h2>

      <div className="mt-6 grid grid-cols-5 gap-2" aria-label={`${selectedStyles.length} of ${MAX_WORK_STYLES} traits picked`}>
        {Array.from({ length: MAX_WORK_STYLES }, (_, i) => (
          <div
            key={i}
            className={`flex h-12 items-center justify-center rounded-xl px-1 text-center text-xs font-bold sm:text-sm ${
              selectedStyles[i] ? "pop bg-ink text-white" : "border-2 border-dashed border-line text-ink/30"
            }`}
          >
            {selectedStyles[i] || i + 1}
          </div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {workStyleOptions.map((style) => {
          const isSelected = selectedStyles.includes(style);
          return (
            <button
              key={style}
              type="button"
              aria-pressed={isSelected}
              disabled={!isSelected && selectedStyles.length >= MAX_WORK_STYLES}
              onClick={() => toggleStyle(style)}
              className={`flex items-center justify-between gap-2 rounded-2xl border-2 px-4 py-3 text-left text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-40 ${
                isSelected
                  ? "-translate-y-0.5 border-accent-bright bg-peach text-ink shadow-md"
                  : "border-line bg-white text-ink hover:border-ink/30"
              }`}
            >
              {style}
              {isSelected && <Check className="h-4 w-4 shrink-0 text-accent" strokeWidth={3} aria-hidden="true" />}
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderLoading = () => (
    <div className="card-shadow mx-auto max-w-xl rounded-3xl bg-white p-10 text-center" role="status">
      <img src={FINAL_TROPHY} alt="" className="pop mx-auto mb-6 h-28 w-28 object-contain" />
      <div className="flex justify-center -space-x-2">
        {guideOrder.map((id, i) => (
          <span key={id} className="bob" style={{ animationDelay: `${i * 120}ms` }}>
            <GuideFace id={id} className="h-12 w-12" />
          </span>
        ))}
      </div>
      <h2 className="mt-6 text-2xl font-extrabold tracking-tight text-ink">Your guides are reviewing your answers</h2>
      <p className="mt-2 text-ink-soft">Writing your career report. This can take up to a minute.</p>
    </div>
  );

  const renderLocked = () => {
    const days = daysUntil(lockedUntil);
    return (
      <div className="card-shadow grid overflow-hidden rounded-3xl bg-white md:grid-cols-[0.8fr_1.2fr]">
        <div className="relative flex min-h-[14rem] items-center justify-center bg-peach md:min-h-[24rem]">
          <span
            aria-hidden="true"
            className="absolute inset-0 m-auto h-48 w-48 rounded-full bg-[radial-gradient(closest-side,#FFFFFF,transparent)]"
          />
          <img src={FINAL_TROPHY} alt="" className="pop relative h-36 w-36 object-contain sm:h-44 sm:w-44" />
        </div>
        <div className="p-7 sm:p-10">
          <p className="text-sm font-semibold text-accent">Quiz complete for this month</p>
          <h2 className="mt-1 text-[clamp(1.6rem,3.5vw,2.2rem)] font-extrabold leading-tight tracking-tight text-ink">
            Your next quiz unlocks in {days} {days === 1 ? "day" : "days"}
          </h2>
          <p className="mt-3 leading-relaxed text-ink-soft">
            You can take the career quiz once every {QUIZ_COOLDOWN_DAYS} days, so a new report shows how you've
            changed rather than a second guess. Come back on <strong className="text-ink">{formatDate(lockedUntil)}</strong>.
          </p>
          <div className="mt-6 flex items-center gap-2.5 rounded-2xl bg-surface px-4 py-3 text-sm text-ink-soft">
            <CalendarClock className="h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
            In the meantime, your latest report is saved in your profile.
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <button autoFocus onClick={() => navigate("/profile")} className="btn-primary px-6 py-3">
              View my career report
            </button>
            <button onClick={() => navigate("/resume-generation")} className="btn-outline px-6 py-3">
              Build your resume
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderScreen = () => {
    if (lockedUntil) return renderLocked();
    if (resumeOffer) return renderResume();
    if (!hydrated) {
      return (
        <p className="card-shadow rounded-3xl bg-white p-10 text-center text-ink-soft" role="status">
          Loading your progress...
        </p>
      );
    }
    if (loading) return renderLoading();
    if (checkpointBreak !== null) return renderCheckpointBreak();
    if (isFinalRound) return renderFinalRound();
    return renderQuestion();
  };

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-surface px-4 py-5 sm:px-6 sm:py-6">
      <div className="mx-auto max-w-5xl">
        <div className="card-shadow rounded-3xl bg-white px-4 py-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
            <div className="min-w-0">
              <h1 className="text-lg font-extrabold tracking-tight text-ink sm:text-xl">Career quiz</h1>
              <p className="text-sm font-semibold text-ink-soft">
                {lockedUntil
                  ? `One quiz every ${QUIZ_COOLDOWN_DAYS} days`
                  : !hydrated
                  ? "Your progress is saved as you go"
                  : isFinalRound
                    ? "Final round"
                    : `Checkpoint ${currentCheckpoint + 1} of ${checkpoints.length}: ${checkpoints[currentCheckpoint].title}`}
              </p>
            </div>
            {hydrated && (
              <div className="flex flex-wrap items-center gap-2 text-[13px] font-bold">
                <SaveIndicator status={saveStatus} signedIn={Boolean(uid)} />
                <span className="inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 text-ink">
                  <Zap className="h-4 w-4 fill-accent-bright text-accent-bright" aria-hidden="true" />
                  {xp} XP
                </span>
                <span className="hidden items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 text-ink sm:inline-flex">
                  <Award className="h-4 w-4 text-accent" aria-hidden="true" />
                  {badgesEarned} of {checkpoints.length} badges
                </span>
              </div>
            )}
          </div>
          {hydrated && (
            <div className="mt-4">
              <CheckpointMap
                current={checkpointBreak !== null ? checkpointBreak : currentCheckpoint}
                completed={completed}
                progress={Math.min(page, interestQuestions.length) / interestQuestions.length}
              />
            </div>
          )}
        </div>

        <div className="mt-4">{renderScreen()}</div>

        {hydrated && !loading && checkpointBreak === null && isFinalRound && (
          <div className="mt-4 flex items-center justify-between gap-3">
            {page > 0 ? (
              <button onClick={handlePrevious} className="btn-outline">
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Previous
              </button>
            ) : (
              <span />
            )}
            {isFinalRound && (
              <button onClick={handleSubmit} className="btn-primary px-6 py-3">
                Get my career report
              </button>
            )}
          </div>
        )}
      </div>
    </main>
  );
};

export default Interest;
