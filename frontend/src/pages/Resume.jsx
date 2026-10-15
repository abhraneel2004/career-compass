import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { ArrowLeft, Check, CircleCheck, Download, Plus, UserRound, X } from 'lucide-react';
import { FINAL_TROPHY, guides } from '../data/guides';
import { levelFor, resumeSteps, resumeTasks, strengthLevels } from '../data/resumeSteps';
import { useAuthState } from '../hooks/useAuth';
import { downloadResumePdf, loadResume, saveResume } from '../lib/resume';
import ResumeDocument from '../components/resume/ResumeDocument';

const predefinedSkills = ['JavaScript', 'React', 'Node.js', 'HTML', 'CSS', 'Python', 'Java', 'SQL', 'Communication', 'Decision Making', 'Self-Motivation', 'Team Management', 'Other'];

const FormikField = ({ formik, name, label, placeholder, type = 'text', as = 'input' }) => {
    const Tag = as;
    const error = formik.touched[name] && formik.errors[name];
    return (
        <div>
            <label htmlFor={name} className="field-label">{label}</label>
            <Tag
                id={name}
                name={name}
                type={as === 'input' ? type : undefined}
                rows={as === 'textarea' ? 3 : undefined}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values[name]}
                placeholder={placeholder}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? `${name}-error` : undefined}
                className={`field ${error ? 'border-red-400' : ''}`}
            />
            {error && <p id={`${name}-error`} className="mt-1.5 text-sm text-red-600">{error}</p>}
        </div>
    );
};

const AddButton = ({ onClick, children }) => (
    <button type="button" onClick={onClick} className="btn-outline mt-4 px-4 py-2 text-sm">
        <Plus className="h-4 w-4" aria-hidden="true" />
        {children}
    </button>
);

const MISSING_TOAST = 'resume-missing-fields';

const ResumeGenerator = () => {
    const [preview, setPreview] = useState(false);
    const [step, setStep] = useState(0);
    const [selectedSkills, setSelectedSkills] = useState([]);
    const [isOther, setIsOther] = useState(false);
    const [customSkill, setCustomSkill] = useState('');
    const [achievements, setAchievements] = useState([{ title: '', role: '' }]);
    const [experiences, setExperiences] = useState([{
        company: '',
        role: '',
        startDate: '',
        endDate: ''
    }]);
    // Add after the experiences state declaration
    const [projects, setProjects] = useState([{
        title: '',
        description: '',
        technologies: '',
        link: ''
    }]);

    const [courses, setCourses] = useState([{
        title: '',
        provider: '',
        date: ''
    }]);

    const addSkill = (skill) => {
        if (skill === 'Other') {
            setIsOther(true);
        } else if (!selectedSkills.includes(skill)) {
            setSelectedSkills([...selectedSkills, skill]);
            setIsOther(false);
        }
    };

    const addCustomSkill = () => {
        if (customSkill && !selectedSkills.includes(customSkill)) {
            setSelectedSkills([...selectedSkills, customSkill]);
            setCustomSkill('');
            setIsOther(false);
        }
    };

    const removeSkill = (skill) => {
        setSelectedSkills(selectedSkills.filter((s) => s !== skill));
    };

    const addAchievement = () => {
        setAchievements([...achievements, { title: '', role: '' }]);
    };

    const handleAchievementChange = (index, field, value) => {
        const updatedAchievements = [...achievements];
        updatedAchievements[index][field] = value;
        setAchievements(updatedAchievements);
    };

    const addExperience = () => {
        setExperiences([...experiences, {
            company: '',
            role: '',
            startDate: '',
            endDate: ''
        }]);
    };

    const handleExperienceChange = (index, field, value) => {
        const updatedExperiences = [...experiences];
        updatedExperiences[index][field] = value;
        setExperiences(updatedExperiences);
    };

    const addProject = () => {
        setProjects([...projects, {
            title: '',
            description: '',
            technologies: '',
            link: ''
        }]);
    };

    const handleProjectChange = (index, field, value) => {
        const updatedProjects = [...projects];
        updatedProjects[index][field] = value;
        setProjects(updatedProjects);
    };

    const addCourse = () => {
        setCourses([...courses, {
            title: '',
            provider: '',
            date: ''
        }]);
    };

    const handleCourseChange = (index, field, value) => {
        const updatedCourses = [...courses];
        updatedCourses[index][field] = value;
        setCourses(updatedCourses);
    };

    const formik = useFormik({
        initialValues: {
            name: '',
            email: '',
            phone: '',
            education: '',
            linkedin: '',
            github: '',
        },
        validationSchema: Yup.object({
            name: Yup.string().required('Name is required'),
            email: Yup.string().email('Invalid email').required('Email is required'),
            phone: Yup.string().required('Phone number is required'),
            education: Yup.string().required('Education details are required'),
            linkedin: Yup.string().url('Invalid URL').required('LinkedIn profile is required'),
            github: Yup.string().url('Invalid URL').required('GitHub profile is required'),
        }),
        onSubmit: () => {
            setPreview(true);
        },
    });

    const currentResume = () => ({
        values: formik.values,
        experiences,
        skills: selectedSkills,
        projects,
        achievements,
        courses,
    });

    // Saved resume: loaded into the builder on arrival, saved again each time it's previewed
    const { user, ready: authReady } = useAuthState();
    const [saveState, setSaveState] = useState('idle');
    const loadedFor = useRef(null);

    useEffect(() => {
        if (!authReady || !user || loadedFor.current === user.uid) return;
        loadedFor.current = user.uid;
        loadResume(user.uid)
            .then((saved) => {
                if (!saved || formik.dirty) return;
                formik.resetForm({ values: saved.values });
                setExperiences(saved.experiences);
                setSelectedSkills(saved.skills);
                setProjects(saved.projects);
                setAchievements(saved.achievements);
                setCourses(saved.courses);
                toast.info('We loaded your saved resume. Pick up where you left off.', { toastId: 'resume-loaded' });
            })
            .catch((error) => console.error("Couldn't load the saved resume:", error));
    }, [authReady, user, formik]);

    const saveToProfile = async () => {
        if (!user) return;
        setSaveState('saving');
        try {
            await saveResume(user.uid, currentResume());
            setSaveState('saved');
        } catch (error) {
            console.error("Couldn't save the resume:", error);
            setSaveState('error');
        }
    };

    const tasks = resumeTasks({ values: formik.values, experiences, selectedSkills, projects, achievements, courses });
    const strength = tasks.reduce((sum, task) => sum + (task.done ? task.points : 0), 0);
    const level = levelFor(strength);
    const stepDone = resumeSteps.map((s) => tasks.filter((task) => task.step === s.id).every((task) => task.done));
    const nextTasks = tasks.filter((task) => !task.done).sort((a, b) => b.points - a.points).slice(0, 2);
    const current = resumeSteps[step];
    const coach = guides[current.coach];
    const isLastStep = step === resumeSteps.length - 1;

    // Celebrate each time the resume reaches a higher strength level
    const lastLevel = useRef(level.name);
    useEffect(() => {
        const rank = (name) => strengthLevels.findIndex((l) => l.name === name);
        if (rank(level.name) < rank(lastLevel.current)) {
            toast.success(`Level up! Your resume is now ${level.name}.`, { autoClose: 2500 });
        }
        lastLevel.current = level.name;
    }, [level.name]);

    useEffect(() => {
        window.scrollTo({ top: 0 });
    }, [step, preview]);

    const touchFields = (fields) =>
        formik.setTouched({ ...formik.touched, ...Object.fromEntries(fields.map((field) => [field, true])) }, false);

    // Checks every required field; jumps to the first step with a problem
    const openPreview = async () => {
        const errors = await formik.validateForm();
        const firstProblem = resumeSteps.findIndex((s) => s.fields.some((field) => errors[field]));
        if (firstProblem !== -1) {
            touchFields(resumeSteps.flatMap((s) => s.fields));
            setStep(firstProblem);
            toast.error("A few required details are missing.", { toastId: MISSING_TOAST });
            return;
        }
        toast.dismiss(MISSING_TOAST);
        setPreview(true);
        saveToProfile();
    };

    const goNext = async (e) => {
        e?.preventDefault();
        if (current.fields.length) {
            touchFields(current.fields);
            const errors = await formik.validateForm();
            if (current.fields.some((field) => errors[field])) {
                toast.error("Fill in the highlighted fields to continue.", { toastId: MISSING_TOAST });
                return;
            }
        }
        toast.dismiss(MISSING_TOAST);
        if (isLastStep) {
            openPreview();
        } else {
            setStep(step + 1);
        }
    };

    const improve = (task) => {
        setPreview(false);
        setStep(resumeSteps.findIndex((s) => s.id === task.step));
    };

    const renderStepFields = () => {
        switch (current.id) {
            case 'contact':
                return (
                    <div className="grid gap-4 md:grid-cols-2">
                        <FormikField formik={formik} name="name" label="Full name" placeholder="Aanya Sharma" />
                        <FormikField formik={formik} name="phone" label="Phone" placeholder="+91 98765 43210" />
                        <FormikField formik={formik} name="email" label="Email" placeholder="you@example.com" type="email" />
                        <FormikField formik={formik} name="linkedin" label="LinkedIn URL" placeholder="https://linkedin.com/in/your-name" />
                        <FormikField formik={formik} name="github" label="GitHub URL" placeholder="https://github.com/your-name" />
                    </div>
                );
            case 'education':
                return (
                    <FormikField
                        formik={formik}
                        name="education"
                        label="Degree, institution and years"
                        placeholder="B.Tech in Computer Science, Academy of Technology, 2022–2026"
                        as="textarea"
                    />
                );
            case 'experience':
                return (
                    <>
                        <div className="space-y-4">
                            {experiences.map((exp, index) => (
                                <div key={index} className="grid gap-4 rounded-2xl border border-line p-4 md:grid-cols-2">
                                    <div>
                                        <label htmlFor={`exp-company-${index}`} className="field-label">Company</label>
                                        <input id={`exp-company-${index}`} placeholder="Company name" value={exp.company} onChange={(e) => handleExperienceChange(index, 'company', e.target.value)} className="field" />
                                    </div>
                                    <div>
                                        <label htmlFor={`exp-role-${index}`} className="field-label">Role</label>
                                        <input id={`exp-role-${index}`} placeholder="Job title" value={exp.role} onChange={(e) => handleExperienceChange(index, 'role', e.target.value)} className="field" />
                                    </div>
                                    <div>
                                        <label htmlFor={`exp-start-${index}`} className="field-label">Start date</label>
                                        <input id={`exp-start-${index}`} placeholder="MM/YYYY" value={exp.startDate} onChange={(e) => handleExperienceChange(index, 'startDate', e.target.value)} className="field" />
                                    </div>
                                    <div>
                                        <label htmlFor={`exp-end-${index}`} className="field-label">End date</label>
                                        <input id={`exp-end-${index}`} placeholder="MM/YYYY or Present" value={exp.endDate} onChange={(e) => handleExperienceChange(index, 'endDate', e.target.value)} className="field" />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <AddButton onClick={addExperience}>Add experience</AddButton>
                    </>
                );
            case 'skills':
                return (
                    <>
                        <div className="flex min-h-12 flex-wrap gap-2">
                            {selectedSkills.map((skill) => (
                                <span key={skill} className="pop inline-flex items-center gap-1.5 rounded-full bg-ink py-1.5 pl-3.5 pr-2 text-sm font-semibold text-white">
                                    {skill}
                                    <button
                                        type="button"
                                        onClick={() => removeSkill(skill)}
                                        aria-label={`Remove ${skill}`}
                                        className="rounded-full p-0.5 hover:bg-white/20"
                                    >
                                        <X className="h-3.5 w-3.5" aria-hidden="true" />
                                    </button>
                                </span>
                            ))}
                            {selectedSkills.length === 0 && (
                                <span className="self-center text-sm text-ink-soft">No skills added yet. Pick some below.</span>
                            )}
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-4">
                            {predefinedSkills
                                .filter((skill) => !selectedSkills.includes(skill))
                                .map((skill) => (
                                    <button
                                        key={skill}
                                        type="button"
                                        onClick={() => addSkill(skill)}
                                        className="inline-flex items-center gap-1 rounded-full border border-line bg-white px-3.5 py-1.5 text-sm font-medium text-ink transition-colors hover:border-ink/40"
                                    >
                                        <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                                        {skill}
                                    </button>
                                ))}
                        </div>
                        {isOther && (
                            <div className="mt-4 flex gap-2">
                                <input
                                    value={customSkill}
                                    onChange={(e) => setCustomSkill(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            addCustomSkill();
                                        }
                                    }}
                                    placeholder="Type a skill"
                                    aria-label="Custom skill"
                                    className="field"
                                />
                                <button type="button" onClick={addCustomSkill} className="btn-outline shrink-0">
                                    Add
                                </button>
                            </div>
                        )}
                    </>
                );
            case 'projects':
                return (
                    <>
                        <div className="space-y-4">
                            {projects.map((proj, index) => (
                                <div key={index} className="grid gap-4 rounded-2xl border border-line p-4 md:grid-cols-2">
                                    <div>
                                        <label htmlFor={`proj-title-${index}`} className="field-label">Project title</label>
                                        <input id={`proj-title-${index}`} placeholder="Project name" value={proj.title} onChange={(e) => handleProjectChange(index, 'title', e.target.value)} className="field" />
                                    </div>
                                    <div>
                                        <label htmlFor={`proj-tech-${index}`} className="field-label">Technologies used</label>
                                        <input id={`proj-tech-${index}`} placeholder="React, Node.js" value={proj.technologies} onChange={(e) => handleProjectChange(index, 'technologies', e.target.value)} className="field" />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label htmlFor={`proj-desc-${index}`} className="field-label">Description</label>
                                        <textarea id={`proj-desc-${index}`} rows="3" placeholder="What you built and the result" value={proj.description} onChange={(e) => handleProjectChange(index, 'description', e.target.value)} className="field" />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label htmlFor={`proj-link-${index}`} className="field-label">Link (optional)</label>
                                        <input id={`proj-link-${index}`} placeholder="https://github.com/your-name/project" value={proj.link} onChange={(e) => handleProjectChange(index, 'link', e.target.value)} className="field" />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <AddButton onClick={addProject}>Add project</AddButton>
                    </>
                );
            default:
                return (
                    <>
                        <h3 className="text-sm font-semibold text-ink">Achievements</h3>
                        <div className="mt-2 space-y-3">
                            {achievements.map((ach, index) => (
                                <div key={index} className="grid gap-3 md:grid-cols-2">
                                    <input aria-label={`Achievement ${index + 1} title`} placeholder="Achievement title" value={ach.title} onChange={(e) => handleAchievementChange(index, 'title', e.target.value)} className="field" />
                                    <input aria-label={`Achievement ${index + 1} details`} placeholder="Role or details" value={ach.role} onChange={(e) => handleAchievementChange(index, 'role', e.target.value)} className="field" />
                                </div>
                            ))}
                        </div>
                        <AddButton onClick={addAchievement}>Add achievement</AddButton>

                        <h3 className="mt-8 text-sm font-semibold text-ink">Courses and training</h3>
                        <div className="mt-2 space-y-3">
                            {courses.map((course, index) => (
                                <div key={index} className="grid gap-3 md:grid-cols-3">
                                    <input aria-label={`Course ${index + 1} title`} placeholder="Course title" value={course.title} onChange={(e) => handleCourseChange(index, 'title', e.target.value)} className="field" />
                                    <input aria-label={`Course ${index + 1} provider`} placeholder="Provider (Coursera, Udemy)" value={course.provider} onChange={(e) => handleCourseChange(index, 'provider', e.target.value)} className="field" />
                                    <input aria-label={`Course ${index + 1} completion date`} placeholder="Completion date" value={course.date} onChange={(e) => handleCourseChange(index, 'date', e.target.value)} className="field" />
                                </div>
                            ))}
                        </div>
                        <AddButton onClick={addCourse}>Add course</AddButton>
                    </>
                );
        }
    };

    const strengthMeter = (
        <div className="w-full sm:w-72">
            <div className="flex items-baseline justify-between gap-3 text-sm font-semibold">
                <span className="text-ink">Resume strength</span>
                <span className="text-ink-soft">
                    <span className="text-base font-extrabold text-ink">{strength}</span>/100
                </span>
            </div>
            <div
                className="mt-1.5 h-2.5 rounded-full bg-surface"
                role="meter"
                aria-label="Resume strength"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={strength}
                aria-valuetext={`${strength} out of 100, ${level.name}`}
            >
                <div
                    className="h-2.5 rounded-full bg-accent-bright transition-[width] duration-500 motion-reduce:transition-none"
                    style={{ width: `${strength}%` }}
                />
            </div>
            <p className="mt-1 text-xs font-bold text-accent">{level.name}</p>
        </div>
    );

    if (preview) {
        return (
            <main className="bg-surface px-4 py-5 sm:px-6 sm:py-6">
                <div className="mx-auto max-w-4xl">
                    <div className="card-shadow grid items-center gap-5 rounded-3xl bg-white p-6 text-center sm:p-8 md:grid-cols-[auto_1fr_auto] md:text-left">
                        <img src={FINAL_TROPHY} alt="" className="pop mx-auto h-24 w-24 object-contain" />
                        <div>
                            <p className="text-sm font-semibold text-ink-soft">
                                Strength {strength}/100: {level.name}
                            </p>
                            <h1 className="mt-1 text-[clamp(1.5rem,3vw,2rem)] font-extrabold leading-tight tracking-tight text-ink">
                                Your resume is ready
                            </h1>
                            {nextTasks.length > 0 ? (
                                <div className="mt-3 flex flex-wrap items-center justify-center gap-2 md:justify-start">
                                    <span className="text-sm text-ink-soft">To raise your score:</span>
                                    {nextTasks.map((task) => (
                                        <button
                                            key={task.label}
                                            onClick={() => improve(task)}
                                            className="rounded-full bg-peach px-3 py-1 text-sm font-semibold text-ink transition-colors hover:bg-[#FFD9BF]"
                                        >
                                            {task.label} <span className="text-accent">+{task.points}</span>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <p className="mt-2 text-sm text-ink-soft">Every task is done. Nice work.</p>
                            )}
                        </div>
                        <div className="flex flex-wrap justify-center gap-3 md:flex-col">
                            <button onClick={() => downloadResumePdf(currentResume())} className="btn-primary">
                                <Download className="h-4 w-4" aria-hidden="true" />
                                Download PDF
                            </button>
                            <button onClick={() => setPreview(false)} className="btn-outline">
                                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                                Back to edit
                            </button>
                        </div>
                    </div>

                    {user && saveState !== 'idle' && (
                        <div
                            role="status"
                            className={`mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl px-4 py-3 text-sm font-semibold text-ink ${
                                saveState === 'error' ? 'bg-butter' : 'bg-mint'
                            }`}
                        >
                            <CircleCheck className={`h-5 w-5 shrink-0 ${saveState === 'error' ? 'text-accent' : 'text-[#2F9E78]'}`} aria-hidden="true" />
                            <span className="flex-1">
                                {saveState === 'saving' && 'Saving to your profile...'}
                                {saveState === 'saved' && 'Saved to your profile. You can view, download or edit it there any time.'}
                                {saveState === 'error' && "We couldn't save this to your profile. Download the PDF to keep it."}
                            </span>
                            {saveState === 'saved' && (
                                <Link to="/profile?tab=resume" className="inline-flex items-center gap-1.5 text-accent hover:underline">
                                    <UserRound className="h-4 w-4" aria-hidden="true" />
                                    View in profile
                                </Link>
                            )}
                        </div>
                    )}

                    <div className="mt-5">
                        <ResumeDocument resume={currentResume()} />
                    </div>
                </div>
            </main>
        );
    }

    const stepTasks = tasks.filter((task) => task.step === current.id);

    return (
        <main className="bg-surface px-4 py-5 sm:px-6 sm:py-6">
            <div className="mx-auto max-w-5xl">
                <div className="card-shadow rounded-3xl bg-white px-4 py-4 sm:px-6">
                    <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
                        <div className="min-w-0">
                            <h1 className="text-lg font-extrabold tracking-tight text-ink sm:text-xl">Resume builder</h1>
                            <p className="text-sm font-semibold text-ink-soft">
                                Step {step + 1} of {resumeSteps.length}: {current.title}
                            </p>
                        </div>
                        {strengthMeter}
                    </div>

                    <ol className="relative mt-4 flex items-center justify-between [--inset:1.25rem]" aria-label="Resume steps">
                        <span
                            aria-hidden="true"
                            className="absolute left-[var(--inset)] right-[var(--inset)] top-1/2 h-1 -translate-y-1/2 rounded-full bg-surface"
                        />
                        <span
                            aria-hidden="true"
                            className="absolute left-[var(--inset)] top-1/2 h-1 -translate-y-1/2 rounded-full bg-accent-bright transition-[width] duration-500 motion-reduce:transition-none"
                            style={{ width: `calc((100% - 2 * var(--inset)) * ${step / resumeSteps.length})` }}
                        />
                        {resumeSteps.map((s, index) => {
                            const guide = guides[s.coach];
                            const isCurrent = index === step;
                            return (
                                <li key={s.id}>
                                    <button
                                        type="button"
                                        onClick={() => setStep(index)}
                                        title={`${s.title} with ${guide.name}`}
                                        aria-current={isCurrent ? 'step' : undefined}
                                        className={`relative flex h-10 w-10 items-center justify-center rounded-full bg-white ${
                                            isCurrent ? 'ring-4 ring-accent-bright/25' : ''
                                        }`}
                                    >
                                        <img
                                            src={guide.image}
                                            alt=""
                                            className={`h-10 w-10 rounded-full object-cover object-top transition duration-300 ${guide.tone} ${
                                                !isCurrent && !stepDone[index] ? 'opacity-40 grayscale' : ''
                                            } ${isCurrent ? 'scale-110' : ''}`}
                                        />
                                        {stepDone[index] && (
                                            <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#2F9E78] ring-2 ring-white">
                                                <Check className="h-2.5 w-2.5 text-white" strokeWidth={4} aria-hidden="true" />
                                            </span>
                                        )}
                                        <span className="sr-only">
                                            {s.title}
                                            {stepDone[index] ? ', complete' : ''}
                                        </span>
                                    </button>
                                </li>
                            );
                        })}
                        <li>
                            <button
                                type="button"
                                onClick={openPreview}
                                title="Preview and download"
                                className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white"
                            >
                                <img src={FINAL_TROPHY} alt="" className={`h-10 w-10 object-contain ${strength >= 90 ? '' : 'opacity-40 grayscale'}`} />
                                <span className="sr-only">Preview and download</span>
                            </button>
                        </li>
                    </ol>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-[0.8fr_1.2fr]">
                    <aside className="card-shadow order-last overflow-hidden rounded-3xl bg-white md:order-none md:sticky md:top-24 md:self-start">
                        <div className={`relative hidden h-52 md:block ${coach.tone}`}>
                            <img
                                key={current.coach}
                                src={coach.image}
                                alt={`${coach.name}, ${coach.role}`}
                                className="guide-in absolute bottom-0 left-1/2 h-[92%] w-auto max-w-none -translate-x-1/2 object-contain object-bottom"
                            />
                            <div className="absolute bottom-3 left-3 rounded-2xl bg-white/95 px-3.5 py-2 shadow-sm">
                                <p className="font-bold leading-tight text-ink">{coach.name}</p>
                                <p className="text-sm text-ink-soft">{coach.role}</p>
                            </div>
                        </div>
                        <div className="p-5">
                            {/* Phones: a small face instead of the full coach image */}
                            <div className="mb-3 flex items-center gap-3 md:hidden">
                                <img
                                    src={coach.image}
                                    alt=""
                                    className={`h-12 w-12 rounded-full object-cover object-top ${coach.tone}`}
                                />
                                <div>
                                    <p className="font-bold leading-tight text-ink">{coach.name}</p>
                                    <p className="text-sm text-ink-soft">{coach.role}</p>
                                </div>
                            </div>
                            <p className="text-sm font-semibold text-accent">{coach.name}'s tip</p>
                            <p key={step} className="bubble-in mt-1 leading-relaxed text-ink">“{current.tip}”</p>

                            <p className="mt-5 text-sm font-semibold text-ink">Tasks for this step</p>
                            <ul className="mt-2 space-y-2.5">
                                {stepTasks.map((task, index) => (
                                    <li key={`${task.step}-${index}`} className="flex items-start gap-2.5 text-sm">
                                        <span
                                            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                                                task.done ? 'pop bg-[#2F9E78]' : 'border-2 border-line'
                                            }`}
                                        >
                                            {task.done && <Check className="h-3 w-3 text-white" strokeWidth={3.5} aria-hidden="true" />}
                                        </span>
                                        <span className={task.done ? 'text-ink-soft line-through decoration-ink/30' : 'text-ink'}>
                                            {task.label}
                                            <span className="sr-only">{task.done ? ' (done)' : ''}</span>
                                        </span>
                                        <span className={`ml-auto shrink-0 font-bold ${task.done ? 'text-[#2F9E78]' : 'text-accent'}`}>
                                            +{task.points}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </aside>

                    <form onSubmit={goNext} noValidate className="card-shadow rounded-3xl bg-white p-6 sm:p-8">
                        <p className="text-sm font-semibold text-ink-soft">
                            Step {step + 1} of {resumeSteps.length}
                        </p>
                        <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-ink">{current.title}</h2>
                        <div key={current.id} className="bubble-in mt-6">
                            {renderStepFields()}
                        </div>

                        <div className="mt-8 flex items-center justify-between gap-3 border-t border-line pt-5">
                            {step > 0 ? (
                                <button type="button" onClick={() => setStep(step - 1)} className="btn-outline">
                                    <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                                    Back
                                </button>
                            ) : (
                                <span />
                            )}
                            <button type="submit" className="btn-primary px-6">
                                {isLastStep ? 'Preview my resume' : `Next: ${resumeSteps[step + 1].title}`}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </main>
    );
};

export default ResumeGenerator;
