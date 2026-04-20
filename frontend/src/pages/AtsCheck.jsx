import React, { useState } from 'react';
import { apiCall } from '../api';

export default function AtsCheck() {
    const [isLoading, setIsLoading] = useState(false);
    const [analysisResult, setAnalysisResult] = useState(null);

    const runAnalysis = async () => {
        setIsLoading(true);
        try {
            const result = await apiCall('/ats/check', 'POST', {});
            setAnalysisResult(result);
        } catch (err) {
            alert(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const scoreRadius = 110;
    const circumference = 2 * Math.PI * scoreRadius;

    const getScoreOffset = (score) => {
        return circumference - (circumference * (score / 100));
    };

    const getScoreLabel = (score) => {
        return score > 70 ? 'High probability matches' : 'Critical optimizations needed';
    };

    const getScoreIcon = (score) => {
        return score > 70 ? 'trending_up' : 'trending_flat';
    };

    const getScoreColor = (score) => {
        return score > 70 ? 'text-green-600' : 'text-orange-600';
    };

    return (
        <main className="pt-24 pb-12 px-10 min-h-screen">
            <header className="mb-10 flex justify-between items-end">
                <div>
                    <h2 className="font-headline text-3xl font-bold text-on-surface mb-2">ATS Checker</h2>
                    <p className="text-on-surface-variant font-medium text-lg">Analyze your resume against Applicant Tracking System.</p>
                </div>
            </header>

            {!analysisResult && !isLoading && (
                <div className="flex justify-center items-center h-80 bg-surface-container-lowest rounded-3xl shadow-[0px_4px_20px_rgba(25,27,35,0.04)] border border-outline-variant/15">
                    <button className="bg-gradient-to-br from-primary-container to-primary text-white px-10 py-5 rounded-full font-bold shadow-lg hover:shadow-primary/30 transition-all active:scale-[0.98] text-lg" onClick={runAnalysis}>
                        Get My ATS Score
                    </button>
                </div>
            )}

            {isLoading && (
                <div className="flex justify-center flex-col items-center h-80 bg-surface-container-lowest rounded-3xl shadow-[0px_4px_20px_rgba(25,27,35,0.04)] border border-outline-variant/15 gap-4">
                    <span className="material-symbols-outlined text-primary text-5xl animate-spin delay-75 duration-1000">sync</span>
                    <p className="font-bold text-on-surface-variant text-lg">Analyzing document syntax and tracking semantic markers...</p>
                </div>
            )}

            {analysisResult && (
                <div className="max-w-6xl mx-auto space-y-8">
                    <div className="grid grid-cols-12 gap-8 items-start">

                        <div className="col-span-12 lg:col-span-5 bg-surface-container-lowest rounded-[2rem] shadow-[0px_4px_20px_rgba(25,27,35,0.04)] border border-outline-variant/20 p-10 flex flex-col items-center justify-center relative overflow-hidden">
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-surface-tint opacity-5 blur-3xl rounded-full pointer-events-none"></div>
                            <h3 className="font-headline text-on-surface-variant font-bold text-sm tracking-widest uppercase mb-8">System Evaluated Match</h3>

                            <div className="relative flex items-center justify-center mb-6">
                                <svg className="w-64 h-64 -rotate-90">
                                    <circle className="text-surface-container-high" cx="128" cy="128" fill="transparent" r={scoreRadius} stroke="currentColor" strokeWidth="12"></circle>
                                    <circle className="text-primary-container transition-all duration-1000 ease-out" cx="128" cy="128" fill="transparent" r={scoreRadius} stroke="currentColor" strokeDasharray={circumference} strokeDashoffset={getScoreOffset(analysisResult.score)} strokeLinecap="round" strokeWidth="14"></circle>
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                                    <span className="font-headline text-6xl font-extrabold text-on-surface tracking-tighter">
                                        {analysisResult.score}<span className="text-2xl text-on-surface-variant font-medium">/100</span>
                                    </span>
                                    <span className={`font-semibold text-sm mt-2 flex items-center justify-center gap-1 ${getScoreColor(analysisResult.score)}`}>
                                        <span className="material-symbols-outlined text-sm">{getScoreIcon(analysisResult.score)}</span>
                                        {getScoreLabel(analysisResult.score)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="col-span-12 lg:col-span-7 space-y-8">
                            <div className="bg-surface-container-lowest rounded-[2rem] shadow-[0px_4px_20px_rgba(25,27,35,0.04)] border border-outline-variant/20 overflow-hidden">
                                <div className="p-8 border-b border-outline-variant/20 flex justify-between items-center">
                                    <h3 className="font-headline font-bold text-xl">Actionable Insights</h3>
                                    <span className="bg-secondary-container text-on-secondary-container px-4 py-2 rounded-full text-xs font-bold tracking-wider">
                                        {analysisResult.tips?.length || 0} ITEMS
                                    </span>
                                </div>

                                <div className="divide-y divide-outline-variant/10">
                                    {analysisResult.tips && analysisResult.tips.map((tip, index) => (
                                        <div key={index} className="p-8 hover:bg-surface-bright transition-colors cursor-default group">
                                            <div className="flex items-start gap-5">
                                                <div className="w-12 h-12 rounded-xl bg-primary-fixed flex items-center justify-center shrink-0 shadow-sm border border-primary-fixed">
                                                    <span className="material-symbols-outlined text-primary text-2xl">search_insights</span>
                                                </div>
                                                <div className="flex-1 pt-1">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <h4 className="font-bold text-on-surface text-lg leading-tight">Optimization Recommendation</h4>
                                                    </div>
                                                    <p className="text-on-surface-variant text-[1.05rem] font-medium leading-relaxed">{tip}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
