import React, { useState } from 'react';
import axios from 'axios';
import { Search, Sparkles, Target, Wand2 } from 'lucide-react';
import { API_BASE_URL } from '../config';

const features = [
  { title: 'Get past ATS filters', text: 'Use the words recruiters and screening software look for.', icon: Target, tone: 'bg-peach' },
  { title: 'Tailor in minutes', text: 'See exactly what to add instead of rewriting from scratch.', icon: Wand2, tone: 'bg-sky' },
  { title: 'Highlight the right skills', text: 'Bring the skills this role cares about to the top.', icon: Sparkles, tone: 'bg-lilac' },
];

const JobKeyMatcher = () => {
  const [jobDescription, setJobDescription] = useState('');
  const [responseData, setResponseData] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!jobDescription.trim()) {
      setResponseData('Paste a job description first.');
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(`${API_BASE_URL}/api/resume-keywords`, {
        jobDescription: jobDescription
      });
      setResponseData(res.data.keywords.content);
    } catch (err) {
      console.error(err);
      setResponseData('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="bg-surface px-4 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-6xl">
        <div className="grid items-center gap-8 md:grid-cols-[1.2fr_0.8fr]">
          <div>
            <h1 className="text-[clamp(2rem,4.5vw,3rem)] font-extrabold leading-[1.06] tracking-[-0.03em] text-ink">
              JobKey matcher
            </h1>
            <p className="mt-3 max-w-lg leading-relaxed text-ink-soft">
              Paste a job description and get the keywords your resume should include for that role.
            </p>
          </div>
          <img
            src="/images/scene-jobkey.webp"
            alt="A young man comparing a job posting with his resume on a monitor"
            width="960"
            height="717"
            className="card-shadow hidden aspect-[16/10] w-full rounded-3xl object-cover md:block md:rotate-1"
          />
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <form onSubmit={handleSubmit} className="card-shadow flex flex-col rounded-3xl bg-white p-6 sm:p-8">
            <label htmlFor="job-description" className="field-label">
              Job description
            </label>
            <textarea
              id="job-description"
              rows={12}
              placeholder="Paste the full job posting here, including responsibilities and requirements."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="field flex-1 resize-y leading-relaxed"
            />
            <button type="submit" disabled={loading} className="btn-primary mt-5 self-start px-6 py-3 disabled:opacity-60">
              <Search className="h-4 w-4" aria-hidden="true" />
              {loading ? 'Finding keywords...' : 'Find keywords'}
            </button>
          </form>

          <section aria-live="polite" className="card-shadow flex flex-col rounded-3xl bg-white p-6 sm:p-8">
            <h2 className="text-sm font-semibold text-ink">Keywords for your resume</h2>
            {responseData ? (
              <div className="mt-4 max-h-[26rem] flex-1 overflow-y-auto whitespace-pre-wrap rounded-2xl bg-surface p-5 leading-relaxed text-ink">
                {responseData}
              </div>
            ) : (
              <div className="mt-4 flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-line px-6 py-14 text-center">
                <Search className="h-8 w-8 text-ink/25" aria-hidden="true" />
                <p className="mt-3 max-w-xs text-sm text-ink-soft">
                  Paste a job description and select Find keywords. The keywords to add will appear here.
                </p>
              </div>
            )}
          </section>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {features.map((feature, index) => {
            const FeatureIcon = feature.icon;
            return (
              <div
                key={feature.title}
                className={`card-shadow rounded-2xl p-6 ${feature.tone} ${index % 2 ? 'md:rotate-1' : 'md:-rotate-1'}`}
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white">
                  <FeatureIcon className="h-5 w-5 text-accent" aria-hidden="true" />
                </span>
                <h3 className="mt-4 font-bold text-ink">{feature.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-ink-soft">{feature.text}</p>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
};

export default JobKeyMatcher;
