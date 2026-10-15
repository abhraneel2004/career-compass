# Career Compass

A web app that turns a 60-question career quiz into an AI-written career report. It also includes a resume builder and a job-description keyword matcher.

## Features

- **Career quiz** (`/quiz`): 60 agree/disagree questions in six checkpoints (how you think, where you work best, how you work with people, what you're good at, fields that interest you, what matters to you). Eight guide personas ask the questions: a doctor, a designer, a founder, a data scientist, an engineer, a software engineer, a lawyer and a teacher. A final round asks you to pick 5 work styles. Progress is saved to `localStorage` and, when you are signed in, to Firestore, so you can carry on from another device.
- **AI career report** (`/result`, `/profile`): the backend sends your answers to Google Gemini and gets back a structured report: a summary, your strengths, your 5 best-fit careers with fit scores, skills and entry paths, and next steps. The report is saved to your account and can be downloaded as a PDF (built in the browser with jsPDF). You can take the quiz once every 30 days, and the last 12 reports are kept.
- **Resume builder** (`/resume-generation`): a step-by-step form with a live preview and a strength score. It downloads as a PDF and, when you are signed in, saves to your account.
- **JobKey matcher** (`/jobkey`): paste a job description to get the keywords your resume should include, grouped as hard skills, tools, soft skills, certifications and role-specific terms.
- **Profile** (`/profile`): your saved career reports and resume.
- **Pricing** (`/pricing`): a $2 one-time unlock for the report PDF. **Payment is simulated.** The button sets `isPremium: true` on the user document from the browser, and the paywall is currently turned off (`BYPASS_PAYWALL = true` in `frontend/src/components/report/DownloadReportButton.jsx`).
- **Auth** (`/login`): Firebase Authentication with email/password or Google sign-in.

## Tech stack

| Part | Stack |
| --- | --- |
| Frontend | Vite 6, React 19, React Router 7, Tailwind CSS v4 (`@tailwindcss/vite`), Firebase JS SDK (Auth and Firestore), axios, jsPDF, Formik and Yup, react-toastify, lucide-react, framer-motion, GSAP and `@gsap/react` |
| Backend | Node.js, Express 4 (ES modules), `@google/genai` (Gemini API), `firebase-admin`, cors, dotenv |
| Data | Cloud Firestore, protected by [`firestore.rules`](firestore.rules) |

## Project structure

```
career-compass/
├── firestore.rules          # Firestore security rules
├── frontend/                # Vite + React app
│   ├── public/images/       # Guide portraits, badges, illustrations
│   └── src/
│       ├── App.jsx          # Routes
│       ├── main.jsx         # Entry; shows an error screen if Firebase env vars are missing
│       ├── firebase.js      # Firebase client setup
│       ├── config.js        # Backend base URL
│       ├── pages/           # Home, Result, Resume, Jobkey, Profile, Pricing
│       ├── components/      # Quiz (Interest.jsx), AuthPage, Navbar, home/, report/, resume/, motion/
│       ├── lib/             # Quiz progress, reports, report PDF, resume, animation helpers
│       ├── data/            # Guide personas and checkpoints, resume builder steps
│       └── hooks/           # useAuth
└── backend/                 # Express API
    ├── index.js             # Server entry, mounts routes at /api
    ├── routes.js            # Gemini calls and API routes
    ├── auth.js              # Firebase ID token check
    ├── firebaseAdmin.js     # Firebase Admin setup
    └── reportStore.js       # Saves reports and enforces the 30-day limit
```

## Prerequisites

- Node.js and npm. The backend's `.idx/dev.nix` uses Node.js 20.
- A Firebase project with Authentication and Cloud Firestore.
- A Gemini API key from [Google AI Studio](https://aistudio.google.com).

## Getting started

### 1. Clone and install

```bash
git clone https://github.com/abhraneel2004/career-compass.git
cd career-compass

cd backend && npm install
cd ../frontend && npm install
```

### 2. Set up Firebase

1. Create a project in the [Firebase console](https://console.firebase.google.com).
2. **Authentication:** enable the **Email/Password** and **Google** sign-in providers.
3. **Firestore:** create a database, then paste the contents of [`firestore.rules`](firestore.rules) into Firestore > Rules and publish. The repo has no `firebase.json`, so the rules aren't set up for `firebase deploy`.
4. **Web app config (frontend):** go to Project settings > Your apps, add a Web app and copy its config values.
5. **Service account (backend):** go to Project settings > Service accounts > Generate new private key. Never commit this file. `backend/.gitignore` ignores `*firebase-adminsdk*.json`.

### 3. Configure environment variables

Both packages include a `.env.example`. Copy it to `.env` and fill it in:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

**Backend (`backend/.env`)**

| Variable | Required | Purpose |
| --- | --- | --- |
| `GEMINI_API_KEY` | Yes | Gemini API key used for career reports and keyword extraction. |
| `GEMINI_MODEL` | No | The first Gemini model to try. Defaults to `gemini-3.8-flash`. If a model returns 429, 500, 503 or 504, the server falls back to `gemini-3.6-flash` and then `gemini-3.5-flash-lite`. |
| `PORT` | No | The port the server listens on. Defaults to `8080`. |
| `FIREBASE_SERVICE_ACCOUNT` | Yes, for reports | The service account key JSON, pasted onto one line. Without it, `POST /api/career-suggestions` returns 503. |
| `GOOGLE_APPLICATION_CREDENTIALS` | Alternative | The path to the service account key file. Used only if `FIREBASE_SERVICE_ACCOUNT` is not set. It isn't listed in `.env.example`. |

**Frontend (`frontend/.env`)**

All the `VITE_*` Firebase values come from the Firebase web app config.

| Variable | Required | Purpose |
| --- | --- | --- |
| `VITE_API_KEY` | Yes | Firebase `apiKey` |
| `VITE_AUTH_DOMAIN` | Yes | Firebase `authDomain` |
| `VITE_PROJECT_ID` | Yes | Firebase `projectId` |
| `VITE_STORAGE_BUCKET` | No | Firebase `storageBucket` |
| `VITE_MESSAGING_SENDER_ID` | No | Firebase `messagingSenderId` |
| `VITE_APP_ID` | Yes | Firebase `appId` |
| `VITE_MEASUREMENT_ID` | No | Firebase `measurementId` |
| `VITE_BACKEND_URL` | No | The backend base URL. **If you leave it empty, the app calls the deployed backend at `https://career-compass-1c4a.onrender.com`.** For local development, set it to `http://localhost:8080`. |

If any of the four required Firebase variables is missing, the app shows a "Configuration missing" screen instead of loading.

### 4. Run the dev servers

Run each server in its own terminal:

```bash
# Terminal 1: API on http://localhost:8080 (or $PORT)
cd backend
npm run dev

# Terminal 2: app on Vite's default port, http://localhost:5173
cd frontend
npm run dev
```

To check that the backend is up, run `curl http://localhost:8080/health`.

## Available scripts

**Backend**

| Script | Command | What it does |
| --- | --- | --- |
| `npm run dev` | `nodemon index.js` | Starts the server and restarts it when files change |
| `npm start` | `node index.js` | Starts the server |
| `npm run build` | `npm install` | Installs dependencies (for hosts that run a build step) |

**Frontend**

| Script | Command | What it does |
| --- | --- | --- |
| `npm run dev` | `vite` | Starts the dev server |
| `npm run build` | `vite build` | Builds for production into `dist/` |
| `npm run preview` | `vite preview` | Serves the production build locally |
| `npm run lint` | `eslint .` | Runs ESLint |

## API endpoints

| Method | Path | Auth | Body | Response |
| --- | --- | --- | --- | --- |
| `GET` | `/health` | None | None | `{ status: true, msg }` |
| `POST` | `/api/career-suggestions` | `Authorization: Bearer <Firebase ID token>` | `{ choices: string (max 10,000 chars), workStyles: string[] }` | `{ report, entry, suggestions }`. The report is also saved to `pdfResults/{uid}`. |
| `POST` | `/api/resume-keywords` | None | `{ jobDescription: string }` | `{ keywords: { role, content } }`. `content` is a plain-text keyword list. |

Error responses from `/api/career-suggestions`:

| Status | Meaning |
| --- | --- |
| 400 | Invalid `choices` |
| 401 | Missing or expired token |
| 409 | A report for this user is already being generated |
| 429 | Within the 30-day limit. The body includes `nextQuizAt`. |
| 503 | Firebase Admin is not configured |
| 500 | Gemini or Firestore error. The slot is released so the user can try again. |

## Firestore data and security rules

Each document is keyed by the user's uid, and [`firestore.rules`](firestore.rules) only lets that signed-in user read it:

| Collection | Contents | Who can write |
| --- | --- | --- |
| `users/{uid}` | `email`, `createdAt`, `isPremium`, `resume` | The owner can create and update it. A new account can't start with `isPremium: true`. Deletes are blocked. |
| `quizProgress/{uid}` | In-progress quiz answers, cleared when the quiz is submitted | The owner |
| `pdfResults/{uid}` | Saved career reports, `lastReportAt`, `generatingUntil` | Nobody from the client. Only the backend writes here, through the Admin SDK. |

Because the browser can still update `isPremium`, the simulated payment is not secure. The rules file includes a commented-out condition to add once a server sets premium status.

## Deployment notes

The repo has no deployment config files (no `vercel.json`, `firebase.json` or `render.yaml`). The code points to these hosts:

- **Backend:** the default `VITE_BACKEND_URL` is a Render URL. The backend reads `PORT` from the environment, and `firebaseAdmin.js` recommends `FIREBASE_SERVICE_ACCOUNT` for Render.
- **Frontend:** `npm run build` writes a static site to `frontend/dist/`. The app uses `BrowserRouter`, so the static host must rewrite all paths to `index.html`.

## Notes

- `frontend/package.json` is still named `hacktropica-01`, and `backend/package.json` is still named `node-express-web`. Both names come from the starter templates.
- `frontend/src/App.jsx` still routes an older multi-page quiz (`/strength`, `/education`, `/values`, `/lifestyle`, `/longterm`, `/workenv`, `/workstyle`). The main quiz at `/quiz` doesn't link to these pages.
- `backend/views/` (EJS) and `backend/public/` are leftovers from the Express starter and aren't served. `ejs` and `method-override` are listed as dependencies but aren't used.
- `marked`, `@shadcn/ui` and `dotenv` are listed in the frontend dependencies but aren't imported anywhere in `frontend/src`.
