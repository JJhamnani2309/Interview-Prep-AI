import React, { useState, useEffect } from 'react';
import { apiCall } from '../api';
import { useNavigate } from 'react-router-dom';

export default function ResumeUpload() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [resumeData, setResumeData] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        apiCall('/resume/parsed')
            .then(response => {
                if (response && response.parsed_data) {
                    setResumeData(response.parsed_data);
                }
            })
            .catch(() => console.log('No prior resume'));
    }, []);

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) setSelectedFile(file);
    };

    const uploadResume = async () => {
        if (!selectedFile) return;

        setIsUploading(true);
        setErrorMessage(null);

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const response = await apiCall('/resume/upload', 'POST', formData);
            setResumeData(response.data);
        } catch (err) {
            setErrorMessage(err.message);
        } finally {
            setIsUploading(false);
        }
    };

    const deleteResume = async () => {
        const confirmed = confirm('Delete resume and ALL associated data (MCQ scores, ATS results, HR history)?');
        if (!confirmed) return;

        try {
            await apiCall('/resume/delete', 'DELETE');
            setResumeData(null);
            setSelectedFile(null);
        } catch (err) {
            setErrorMessage(err.message);
        }
    };

    const hasResume = !!resumeData;
    const skills = resumeData?.skills || [];
    const hasSkills = skills.length > 0;
    const difficultyLevel = resumeData?.difficulty_level || 'Medium';

    const fileStatusLabel = selectedFile
        ? selectedFile.name
        : hasResume
            ? 'Last Synchronized Resume'
            : 'No Resume Uploaded';

    const fileStatusDetail = hasResume
        ? `Complexity match: ${difficultyLevel}`
        : 'Awaiting initialization...';

    const browseLabel = selectedFile ? "Change Document" : "Browse Local Files";
    const uploadLabel = isUploading ? 'Processing...' : 'Analyze Resume';

    return (
        <main className="pt-24 px-12 pb-16 min-h-screen">
            <header className="mb-12 max-w-4xl">
                <h2 className="text-4xl font-extrabold text-on-surface mb-3 headline tracking-tight">Resume Scanner</h2>
                <p className="text-on-surface-variant text-lg leading-relaxed max-w-2xl">Upload your resume to allow our AI to detect your skills and experience. We'll parse your skills, highlight experience gaps, and tailor mock sessions according to your skills.</p>
            </header>

            <div className="grid grid-cols-12 gap-8 items-start">
                <div className="col-span-12 lg:col-span-8">
                    <section className="bg-surface-container-lowest rounded-xl p-10 border-2 border-dashed border-outline-variant hover:border-primary/40 transition-all flex flex-col items-center justify-center min-h-[400px] relative overflow-hidden group">
                        <div className="absolute inset-0 ai-pulse opacity-50 z-0"></div>
                        <div className="relative z-10 flex flex-col items-center text-center w-full">
                            <div className="w-20 h-20 bg-primary-fixed flex items-center justify-center rounded-full mb-6 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                                <span className="material-symbols-outlined text-primary text-4xl">cloud_upload</span>
                            </div>

                            <h3 className="text-2xl font-bold text-on-surface mb-2 headline">Upload your profile</h3>
                            <p className="text-on-surface-variant mb-8 font-medium">Supports PDF (Max 5MB)</p>

                            <input type="file" id="resume-upload" accept=".pdf" onChange={handleFileSelect} className="hidden" />

                            <div className="flex gap-4 items-center mb-10">
                                <label htmlFor="resume-upload" className="px-8 py-3 outline outline-2 outline-primary text-primary cursor-pointer rounded-xl font-bold hover:bg-surface-variant transition-all active:scale-[0.98]">
                                    {browseLabel}
                                </label>

                                {selectedFile && (
                                    <button onClick={uploadResume} disabled={isUploading} className="px-8 py-3 bg-gradient-to-br from-primary-container to-primary text-white rounded-xl font-bold shadow-lg hover:shadow-primary/30 transition-all active:scale-[0.98]">
                                        {uploadLabel}
                                    </button>
                                )}
                            </div>
                            {errorMessage && <p className="text-error bg-error-container p-2 rounded-lg mt-4 w-full text-left font-bold">{errorMessage}</p>}

                            <div className="mt-8 flex items-center justify-center gap-6 w-full">
                                <div className="flex items-center gap-2 text-on-surface-variant text-sm font-medium">
                                    <span className="material-symbols-outlined text-blue-500">verified_user</span> Privacy Guaranteed
                                </div>
                                <div className="flex items-center gap-2 text-on-surface-variant text-sm font-medium">
                                    <span className="material-symbols-outlined text-blue-500">auto_awesome</span> AI-Powered Analysis
                                </div>
                            </div>
                        </div>
                    </section>

                    <div className="mt-8 flex gap-6">
                        <div className="flex-1 bg-surface-container-low rounded-xl p-6 flex items-center gap-4 border border-outline-variant/30">
                            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
                                <span className="material-symbols-outlined text-primary">picture_as_pdf</span>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-on-surface">{fileStatusLabel}</p>
                                <p className="text-xs text-on-surface-variant">{fileStatusDetail}</p>
                            </div>
                            {hasResume && <>
                                <button className="ml-auto text-primary text-sm font-bold bg-surface-variant p-2 rounded-lg" onClick={() => navigate('/dashboard')}>Return to Dashboard</button>
                                <button className="text-error text-sm font-bold bg-error-container p-2 rounded-lg ml-2" onClick={deleteResume}>
                                    <span className="material-symbols-outlined text-sm align-middle mr-1">delete</span>Delete
                                </button>
                            </>}
                        </div>
                    </div>
                </div>

                <div className="col-span-12 lg:col-span-4 space-y-8">
                    <section className="bg-surface-container-lowest rounded-xl p-8 shadow-[0px_4px_20px_rgba(25,27,35,0.04)] border border-outline-variant/30">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold headline">Parsed Elements</h3>
                            {hasResume && <span className="px-2 py-1 bg-secondary-container text-on-secondary-container text-[10px] font-bold rounded uppercase">Verified</span>}
                        </div>

                        {hasSkills ? (
                            <div className="space-y-4">
                                <p className="text-xs font-extrabold text-on-surface-variant uppercase tracking-widest mb-3">Extracted Skills</p>
                                {skills.map((skill, index) => (
                                    <div key={index} className="flex items-center gap-3 p-2 rounded-lg bg-surface-container-low group border border-outline-variant/20">
                                        <div className="w-5 h-5 border-2 border-primary rounded flex items-center justify-center bg-primary text-white">
                                            <span className="material-symbols-outlined text-[14px] font-bold">check</span>
                                        </div>
                                        <span className="text-sm font-medium text-on-surface">{skill}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="h-32 flex items-center justify-center rounded-xl bg-surface-container-low text-on-surface-variant text-center">
                                Sync document to unlock contextual skills map.
                            </div>
                        )}
                    </section>

                    <section className="bg-primary text-white rounded-xl p-8 shadow-xl relative overflow-hidden">
                        <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
                        <span className="material-symbols-outlined text-white/40 mb-4 block text-3xl">bolt</span>
                        <h3 className="text-lg font-bold mb-2 headline">Architect's Insight</h3>
                        <p className="text-primary-fixed text-sm leading-relaxed mb-6 opacity-90">Upload your PDF accurately to fuel the Mock simulation models effectively over Chromadb retrieval layers.</p>
                    </section>
                </div>
            </div>
        </main>
    );
}
