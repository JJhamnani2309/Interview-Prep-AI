import React, { useEffect, useState } from 'react';
import { apiCall } from '../api';
import { Link } from 'react-router-dom';

export default function Dashboard() {
    const [dashboardData, setDashboardData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        apiCall('/dashboard/history')
            .then(result => setDashboardData(result))
            .catch(err => console.error(err))
            .finally(() => setIsLoading(false));
    }, []);

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center">Loading dashboard...</div>;
    }

    const stats = dashboardData?.stats || {};
    const mcqHistory = dashboardData?.mcq_history || [];
    const readinessScore = Math.round((stats.average_mcq_score / 10) * 100) || 0;
    const totalSessions = stats.total_sessions || 0;
    const avgMcqScore = stats.average_mcq_score || 0;
    const avgHrScore = stats.average_hr_score || 0;

    return (
        <main className="pt-24 px-8 pb-12 w-full max-w-7xl mx-auto">

            <div className="grid grid-cols-12 gap-8 mb-12">
                <div className="col-span-12 lg:col-span-8 bg-surface-container-lowest rounded-xl p-8 flex flex-col md:flex-row items-center gap-10 shadow-[0px_4px_20px_rgba(25,27,35,0.04)]">
                    <div className="relative w-48 h-48 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle className="text-surface-container-high" cx="96" cy="96" fill="transparent" r="88" stroke="currentColor" strokeWidth="12"></circle>
                            <circle className="text-primary" cx="96" cy="96" fill="transparent" r="88" stroke="currentColor" strokeDasharray="552.92" strokeDashoffset="138.23" strokeWidth="12"></circle>
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-5xl font-extrabold brand-font text-on-surface">
                                {readinessScore}
                            </span>
                            <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Readiness</span>
                        </div>
                    </div>
                    <div className="flex-1 space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary-container text-on-secondary-fixed-variant rounded-full text-xs font-bold uppercase tracking-wider">
                            <span className="material-symbols-outlined text-sm">trending_up</span> Consistent Progress
                        </div>
                        <h1 className="text-3xl font-headline font-extrabold text-on-surface leading-tight">Welcome to your Dashboard.</h1>
                        <p className="text-on-surface-variant text-lg leading-relaxed">
                            You have completed <span className="font-bold text-primary">{totalSessions}</span> sessions.
                            Ensure you try mock interviews and skill tests to boost readiness.
                        </p>
                        <div className="flex gap-4 pt-2">
                            <Link to="/mcq" className="px-6 py-3 bg-primary-gradient text-white font-bold rounded-xl text-sm transition-transform active:scale-95 inline-block text-center hover:opacity-90">Start Skill Test</Link>
                            <Link to="/hr-interview" className="px-6 py-3 text-on-surface-variant border-2 border-outline-variant font-bold rounded-xl text-sm transition-colors hover:bg-surface-variant inline-block text-center">Mock Interview</Link>
                        </div>
                    </div>
                </div>

                <div className="col-span-12 lg:col-span-4 bg-surface-container-low rounded-xl p-8 flex flex-col justify-between relative overflow-hidden ai-pulse-glow border border-surface-container">
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 text-surface-tint mb-4">
                            <span className="material-symbols-outlined justify-center" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                            <span className="text-xs font-bold uppercase tracking-widest">AI Action Item</span>
                        </div>
                        <h3 className="text-xl font-headline font-bold mb-3">Sync Your Context</h3>
                        <p className="text-sm text-on-surface-variant leading-relaxed">Ensure you have an up-to-date resume parsed to fully unlock customized AI generation capabilities.</p>
                    </div>
                    <div className="relative z-10 mt-6">
                        <Link to="/resume-upload" className="block w-full bg-white text-on-surface font-bold py-3 rounded-xl text-sm shadow-sm hover:shadow-md transition-all text-center">Go to Resume Upload</Link>
                    </div>
                    <div className="absolute -right-8 -bottom-8 w-40 h-40 rounded-full bg-surface-tint opacity-10 blur-3xl"></div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <div className="bg-surface-container-lowest p-6 rounded-xl space-y-4 shadow-[0px_4px_20px_rgba(25,27,35,0.04)]">
                    <div className="flex items-center justify-between">
                        <span className="p-2 bg-blue-50 text-primary rounded-lg material-symbols-outlined">calendar_today</span>
                    </div>
                    <div>
                        <p className="text-sm text-on-surface-variant font-medium">Total Actions</p>
                        <p className="text-3xl font-extrabold brand-font">{totalSessions}</p>
                    </div>
                </div>

                <div className="bg-surface-container-lowest p-6 rounded-xl space-y-4 shadow-[0px_4px_20px_rgba(25,27,35,0.04)]">
                    <div className="flex items-center justify-between">
                        <span className="p-2 bg-orange-50 text-tertiary-container rounded-lg material-symbols-outlined">assessment</span>
                    </div>
                    <div>
                        <p className="text-sm text-on-surface-variant font-medium">Avg. MCQ Score</p>
                        <p className="text-3xl font-extrabold brand-font">{avgMcqScore}</p>
                    </div>
                </div>

                <div className="bg-surface-container-lowest p-6 rounded-xl space-y-4 shadow-[0px_4px_20px_rgba(25,27,35,0.04)]">
                    <div className="flex items-center justify-between">
                        <span className="p-2 bg-indigo-50 text-secondary rounded-lg material-symbols-outlined">psychology</span>
                    </div>
                    <div>
                        <p className="text-sm text-on-surface-variant font-medium">Avg. HR Score</p>
                        <p className="text-3xl font-extrabold brand-font">{avgHrScore}</p>
                    </div>
                </div>

                <div className="bg-surface-container-lowest p-6 rounded-xl space-y-4 shadow-[0px_4px_20px_rgba(25,27,35,0.04)]">
                    <div className="flex items-center justify-between">
                        <span className="p-2 bg-green-50 text-green-700 rounded-lg material-symbols-outlined">rule</span>
                    </div>
                    <div>
                        <p className="text-sm text-on-surface-variant font-medium">ATS Checkers</p>
                        <Link to="/ats-check" className="text-secondary font-bold hover:underline">Scan Now</Link>
                    </div>
                </div>
            </div>

            <div className="flex items-end justify-between mb-6">
                <h3 className="text-2xl font-headline font-bold text-on-surface">Recent MCQ History</h3>
            </div>
            <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-[0px_4px_20px_rgba(25,27,35,0.04)]">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-surface-container-low">
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Focus Area</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Score</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Total</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-container-low">
                        {mcqHistory.length > 0 ? mcqHistory.map((entry, index) => (
                            <tr key={index} className="hover:bg-background transition-colors group">
                                <td className="px-6 py-5 font-bold text-on-surface">{entry.skills?.join(', ') || 'Mixed'}</td>
                                <td className="px-6 py-5 text-sm font-bold text-primary">{entry.score}</td>
                                <td className="px-6 py-5 text-sm font-bold">{entry.total}</td>
                            </tr>
                        )) : (
                            <tr><td colSpan="3" className="px-6 py-5 text-center text-on-surface-variant font-semibold h-24">No MCQ History Found</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </main>
    );
}
