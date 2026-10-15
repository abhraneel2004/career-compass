import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

// Firebase throws on startup without these, which leaves a blank page
const requiredEnv = ['VITE_API_KEY', 'VITE_AUTH_DOMAIN', 'VITE_PROJECT_ID', 'VITE_APP_ID'];
const missingEnv = requiredEnv.filter((key) => !import.meta.env[key]);

const root = ReactDOM.createRoot(document.getElementById('root'));

if (missingEnv.length > 0) {
  console.error('Missing Firebase environment variables:', missingEnv.join(', '));
  root.render(
    <div className="p-8 font-sans">
      <h1 className="text-2xl font-bold mb-2">Configuration missing</h1>
      <p className="mb-2">These environment variables are not set: {missingEnv.join(', ')}</p>
      <p>Add them to <code>frontend/.env</code> (see <code>.env.example</code>) and restart the dev server or rebuild.</p>
    </div>
  );
} else {
  // Imported lazily so firebase.js only initializes once the config is present
  import('./App').then((module) => {
    const App = module.default;
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  });
}
