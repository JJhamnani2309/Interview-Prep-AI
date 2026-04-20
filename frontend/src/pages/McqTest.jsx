import React, { useState, useEffect } from 'react';
import { apiCall } from '../api';
import { useNavigate } from 'react-router-dom';

const QUESTIONS_PER_SKILL = 10;
const DIFFICULTY_OPTIONS = ['Easy', 'Medium', 'Hard'];
const JOB_ROLES = [
    'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
    'Software Engineer', 'UI/UX Designer', 'Data Scientist',
    'Mobile Developer', 'DevOps Engineer', 'QA Engineer', 'Product Manager', 'None'
];
const ANSWER_LABELS = ['A', 'B', 'C', 'D'];

const difficultyColors = {
    Easy: 'bg-green-500 text-white shadow-lg shadow-green-500/20',
    Medium: 'bg-amber-500 text-white shadow-lg shadow-amber-500/20',
    Hard: 'bg-red-500 text-white shadow-lg shadow-red-500/20',
};

export default function McqTest() {
    const [isLoading, setIsLoading] = useState(false);
    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [isTestComplete, setIsTestComplete] = useState(false);
    const [finalScore, setFinalScore] = useState(0);
    const [resumeData, setResumeData] = useState(null);
    const [selectedSkills, setSelectedSkills] = useState([]);
    const [filteredSkillsPool, setFilteredSkillsPool] = useState([]);
    const [jobRole, setJobRole] = useState('');
    const [isFiltering, setIsFiltering] = useState(false);
    const [customSkill, setCustomSkill] = useState('');
    const [difficulty, setDifficulty] = useState('Medium');
    const [phase, setPhase] = useState('select');
    const [tabSwitches, setTabSwitches] = useState(0);

    const navigate = useNavigate();

    useEffect(() => {
        apiCall('/resume/parsed')
            .then(response => setResumeData(response.parsed_data))
            .catch(() => { });
    }, []);

    useEffect(() => {
        if (phase !== 'test') return;

        const handleVisibilityChange = () => {
            if (document.hidden) {
                setTabSwitches(prev => {
                    const newCount = prev + 1;
                    if (newCount >= 3) {
                        alert("Warning: You have switched tabs multiple times. Your test will be auto-submitted now.");
                        finishTest();
                    } else {
                        alert(`Warning: Tab switching is not allowed. Warning ${newCount}/3`);
                    }
                    return newCount;
                });
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [phase]);

    const toggleSkill = (skill) => {
        setSelectedSkills(previous =>
            previous.includes(skill)
                ? previous.filter(s => s !== skill)
                : [...previous, skill]
        );
    };

    const filterSkillsByRole = async () => {
        if (!jobRole) {
            alert('Please select a job role first!');
            return;
        }
        setIsFiltering(true);
        try {
            const response = await apiCall('/mcq/filter-skills/', 'POST', {
                job_role: jobRole,
                skills: resumeData?.skills || []
            });
            if (response.filtered_skills) {
                setFilteredSkillsPool(response.filtered_skills);
                setSelectedSkills(response.filtered_skills);
            }
        } catch (err) {
            console.error(err);
            alert('Failed to filter skills');
        } finally {
            setIsFiltering(false);
        }
    };

    const addCustomSkill = () => {
        const trimmed = customSkill.trim();
        if (trimmed && !filteredSkillsPool.includes(trimmed)) {
            setFilteredSkillsPool(prev => [...prev, trimmed]);
            setSelectedSkills(prev => [...prev, trimmed]);
            setCustomSkill('');
        }
    };

    const generateQuestions = async () => {
        if (!selectedSkills.length) {
            alert("Pick at least one skill!");
            return;
        }

        setIsLoading(true);
        try {
            const response = await apiCall('/mcq/generate', 'POST', {
                skills: selectedSkills,
                difficulty: difficulty,
            });
            if (response.questions) {
                setQuestions(response.questions);
                setPhase('test');
            }
        } catch (err) {
            console.error(err);
            alert("Error generating questions.");
        } finally {
            setIsLoading(false);
        }
    };

    const selectAnswer = (option) => {
        if (isTestComplete) return;
        setSelectedAnswers({ ...selectedAnswers, [currentIndex]: option });
    };

    const goToNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            finishTest();
        }
    };

    const finishTest = async () => {
        let score = 0;
        questions.forEach((question, index) => {
            if (selectedAnswers[index] === question.correct_answer) {
                score++;
            }
        });

        setFinalScore(score);
        setIsTestComplete(true);
        setPhase('result');

        try {
            await apiCall('/mcq/submit', 'POST', {
                score,
                total: questions.length,
                skills: selectedSkills,
            });
        } catch (err) {
            console.error('Failed to submit score');
        }
    };

    const resetTest = () => {
        setQuestions([]);
        setCurrentIndex(0);
        setSelectedAnswers({});
        setIsTestComplete(false);
        setFinalScore(0);
        setSelectedSkills([]);
        setFilteredSkillsPool([]);
        setJobRole('');
        setCustomSkill('');
        setPhase('select');
    };

    if (phase === 'select') {
        const availableSkills = resumeData?.skills || [];
        const totalQuestions = selectedSkills.length * QUESTIONS_PER_SKILL;
        const hasSkills = availableSkills.length > 0;
        const canGenerate = selectedSkills.length > 0;

        return (
            <main className="pt-24 px-12 pb-16 min-h-screen">
                <header className="mb-10 max-w-4xl">
                    <h2 className="text-4xl font-extrabold text-on-surface mb-3 font-headline tracking-tight">MCQ Assessment</h2>
                    <p className="text-on-surface-variant text-lg leading-relaxed max-w-2xl">Select the Job role that you want to perpare for along with the difficulty level. Total {QUESTIONS_PER_SKILL} questions per skill will be generated to test your knowledge.</p>
                </header>

                {!hasSkills ? (
                    <div className="flex flex-col items-center justify-center h-64 bg-surface-container-lowest rounded-2xl border border-outline-variant/20">
                        <span className="material-symbols-outlined text-5xl text-outline mb-4">quiz</span>
                        <p className="text-on-surface-variant text-lg font-medium">Upload a resume first to detect your skills.</p>
                        <button onClick={() => navigate('/resume-upload')} className="mt-6 px-8 py-3 bg-primary text-white rounded-full font-bold">Go to Resume</button>
                    </div>
                ) : (
                    <>
                        <div className="bg-surface-container-lowest p-8 rounded-2xl border border-outline-variant/30 mb-8 shadow-sm">
                            <h3 className="text-xl font-bold text-on-surface mb-6">Target Role & Settings</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <label className="block text-sm font-bold text-on-surface-variant uppercase  mb-3">Job Role</label>
                                    <div className="flex gap-3">
                                        <select
                                            value={jobRole}
                                            onChange={(e) => setJobRole(e.target.value)}
                                            className="flex-1 bg-surface-container-low border border-outline-variant/40 rounded-xl px-4 py-3 text-on-surface font-medium focus:ring-2 focus:ring-primary focus:outline-none"
                                        >
                                            <option value="">Select your Role</option>
                                            {JOB_ROLES.map(role => (
                                                <option key={role} value={role}>{role}</option>
                                            ))}
                                        </select>
                                        <button
                                            onClick={filterSkillsByRole}
                                            disabled={isFiltering || !jobRole}
                                            className="px-6 py-3 bg-primary text-white rounded-xl font-bold shadow-md hover:shadow-lg disabled:opacity-50 transition-all whitespace-nowrap"
                                        >
                                            {isFiltering ? 'Filtering...' : 'Filter'}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-on-surface-variant uppercase tracking-widest mb-3">Difficulty</label>
                                    <div className="flex gap-3">
                                        {DIFFICULTY_OPTIONS.map(level => (
                                            <button
                                                key={level}
                                                onClick={() => setDifficulty(level)}
                                                className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all active:scale-95 ${difficulty === level
                                                    ? difficultyColors[level]
                                                    : 'bg-surface-container-low text-on-surface-variant border border-outline-variant/30 hover:bg-surface-variant'
                                                    }`}
                                            >
                                                {level}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {filteredSkillsPool.length > 0 && (
                            <div className="mb-10 animate-fade-in">
                                <div className="flex justify-between items-end mb-6">
                                    <h3 className="text-xl font-bold text-on-surface">Relevant Skills Identified</h3>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={customSkill}
                                            onChange={(e) => setCustomSkill(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && addCustomSkill()}
                                            placeholder="Add custom skill..."
                                            className="bg-surface-container-low border border-outline-variant/40 rounded-lg px-4 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                        <button
                                            onClick={addCustomSkill}
                                            disabled={!customSkill.trim()}
                                            className="p-2 bg-secondary text-on-secondary rounded-lg font-bold disabled:opacity-50 flex items-center justify-center transition-all hover:bg-secondary-container hover:text-on-secondary-container"
                                            title="Add Custom Skill"
                                        >
                                            <span className="material-symbols-outlined text-base">add</span>
                                        </button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-10">
                                    {filteredSkillsPool.map((skill, index) => {
                                        const isSelected = selectedSkills.includes(skill);
                                        return (
                                            <button
                                                key={index}
                                                onClick={() => toggleSkill(skill)}
                                                className={`group relative p-6 rounded-2xl border-2 text-left transition-all active:scale-[0.97] ${isSelected
                                                    ? 'border-primary bg-primary-fixed shadow-lg shadow-primary/10'
                                                    : 'border-outline-variant/30 bg-surface-container-lowest hover:border-primary-container/50 hover:shadow-md'
                                                    }`}
                                            >
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-colors ${isSelected ? 'bg-primary text-white' : 'bg-surface-container-high text-on-surface-variant'}`}>
                                                    <span className="material-symbols-outlined">{isSelected ? 'check' : 'code'}</span>
                                                </div>
                                                <p className={`font-bold text-base ${isSelected ? 'text-primary' : 'text-on-surface'}`}>{skill}</p>
                                                <p className="text-xs text-on-surface-variant mt-1">{QUESTIONS_PER_SKILL} questions</p>
                                                {isSelected && (
                                                    <div className="absolute top-3 right-3 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                                                        <span className="material-symbols-outlined text-white text-sm">check</span>
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className="flex items-center justify-between bg-surface-container-low p-6 rounded-2xl border border-outline-variant/20">
                                    <div>
                                        <p className="text-on-surface font-bold">{selectedSkills.length} skill{selectedSkills.length !== 1 ? 's' : ''} selected</p>
                                        <p className="text-sm text-on-surface-variant">{totalQuestions} questions total • {difficulty} difficulty</p>
                                    </div>
                                    <button
                                        onClick={generateQuestions}
                                        disabled={isLoading || !canGenerate}
                                        className="px-10 py-4 bg-gradient-to-br from-primary-container to-primary text-white rounded-full font-bold shadow-lg hover:shadow-primary/30 transition-all active:scale-95 disabled:opacity-50 text-lg"
                                    >
                                        {isLoading ? 'Generating...' : 'Start Assessment'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </main>
        );
    }

    if (phase === 'result') {
        const masteryPercent = Math.round((finalScore / questions.length) * 100);

        return (
            <main className="min-h-[80vh] flex flex-col pt-32 px-12 items-center text-center">
                <div className="bg-surface-container-lowest p-12 rounded-3xl w-full max-w-2xl shadow-[0px_4px_20px_rgba(25,27,35,0.04)] border border-outline-variant/30 flex flex-col items-center">
                    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 shadow-sm">
                        <span className="material-symbols-outlined text-green-700 text-5xl">military_tech</span>
                    </div>
                    <h2 className="text-3xl font-extrabold font-headline mb-2 text-on-surface">Assessment Complete!</h2>
                    <p className="text-on-surface-variant text-lg mb-2">Skills: <span className="font-bold text-primary">{selectedSkills.join(', ')}</span></p>
                    <p className="text-on-surface-variant text-lg mb-8">Mastery: <span className="font-bold text-primary">{masteryPercent}%</span></p>
                    <div className="text-[5rem] font-bold text-on-surface mb-10 leading-none">
                        {finalScore} <span className="text-2xl text-outline">/ {questions.length}</span>
                    </div>
                    <div className="flex gap-4">
                        <button className="px-8 py-4 bg-surface-container text-on-surface rounded-full font-bold border border-outline-variant/20" onClick={resetTest}>Try Different Skills</button>
                        <button className="px-8 py-4 bg-gradient-to-br from-primary-container to-primary text-white rounded-full font-bold shadow-lg" onClick={() => navigate('/dashboard')}>Dashboard</button>
                    </div>
                </div>
            </main>
        );
    }

    const currentQuestion = questions[currentIndex];
    const progressPercent = Math.round((currentIndex / questions.length) * 100);
    const isLastQuestion = currentIndex === questions.length - 1;
    const hasAnsweredCurrent = !!selectedAnswers[currentIndex];

    return (
        <main className="relative pb-32 pt-24 min-h-screen">
            <section className="flex flex-col items-center justify-center px-12 pt-8 w-full max-w-4xl mx-auto">
                <div className="w-full">
                    <div className="flex justify-between items-end mb-8">
                        <div>
                            <span className="text-primary font-bold text-sm tracking-wider uppercase">Question {currentIndex + 1} of {questions.length}</span>
                            <h3 className="text-3xl font-extrabold font-headline mt-2 leading-tight max-w-3xl">{currentQuestion.question}</h3>
                        </div>
                        <span className="px-5 py-2 bg-secondary-container text-on-secondary-container text-sm font-bold rounded-full shadow-sm shrink-0 ml-8">{difficulty}</span>
                    </div>

                    <div className="grid grid-cols-1 gap-5">
                        {currentQuestion.options.map((option, index) => {
                            const isSelected = selectedAnswers[currentIndex] === option;
                            return (
                                <button
                                    key={index}
                                    onClick={() => selectAnswer(option)}
                                    className={`group flex items-center text-left p-6 bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(25,27,35,0.04)] border-[2px] transition-all active:scale-[0.98] ${isSelected
                                        ? 'border-primary bg-primary-fixed'
                                        : 'border-outline-variant/30 hover:border-primary-container/50'
                                        }`}
                                >
                                    <div className={`w-14 h-14 flex items-center justify-center rounded-lg font-bold text-xl mr-6 shadow-sm ${isSelected ? 'bg-primary text-white' : 'bg-surface-container-low text-on-surface-variant'}`}>
                                        {ANSWER_LABELS[index]}
                                    </div>
                                    <p className={`font-medium leading-relaxed text-lg flex-1 ${isSelected ? 'text-on-primary-fixed-variant font-semibold' : 'text-on-surface'}`}>{option}</p>
                                    {isSelected && <span className="material-symbols-outlined text-primary ml-auto text-3xl">check_circle</span>}
                                </button>
                            );
                        })}
                    </div>

                    <div className="mt-12 flex justify-end">
                        <button
                            onClick={goToNext}
                            disabled={!hasAnsweredCurrent}
                            className="px-10 py-4 rounded-full bg-gradient-to-br from-primary-container to-primary text-white font-bold shadow-xl disabled:opacity-50 text-lg"
                        >
                            {isLastQuestion ? 'Finish Assessment' : 'Next Question'}
                        </button>
                    </div>
                </div>
            </section>

            <footer className="fixed bottom-0 right-0 w-[calc(100%-16rem)] bg-white/90 backdrop-blur-md p-6 px-12 z-40 border-t border-outline-variant/30">
                <div className="max-w-4xl mx-auto">
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Progress</span>
                        <span className="text-xs font-bold text-primary">{progressPercent}%</span>
                    </div>
                    <div className="w-full h-3 bg-surface-container-high rounded-full overflow-hidden">
                        <div className="h-full bg-primary-container rounded-full transition-[width] duration-300" style={{ width: `${progressPercent}%` }}></div>
                    </div>
                </div>
            </footer>
        </main>
    );
}
