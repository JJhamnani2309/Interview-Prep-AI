import React, { useState, useEffect, useRef } from 'react';
import { apiCall } from '../api';

export default function HrMock() {
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [userAnswer, setUserAnswer] = useState('');
    const [evaluationResult, setEvaluationResult] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [tabSwitches, setTabSwitches] = useState(0);
    const [useVoice, setUseVoice] = useState(true);

    const recognitionRef = useRef(null);
    const textBeforeRecordingRef = useRef('');

    const fetchNewQuestion = async () => {
        setIsLoading(true);
        setEvaluationResult(null);
        setUserAnswer('');
        try {
            const response = await apiCall('/hr/question', 'POST', {});
            setCurrentQuestion(response.question);
            if (useVoice) {
                speakText(response.question);
            }
        } catch (err) {
            alert("Failed to get question.");
        } finally {
            setIsLoading(false);
        }
    };

    const speakText = (text, toggle = false) => {
        if (!window.speechSynthesis) return;
        if (toggle && isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            return;
        }
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
    };

    const toggleRecording = () => {
        if (isRecording) {
            console.log("Stopping speech recognition...");
            recognitionRef.current?.stop();
            setIsRecording(false);
        } else {
            console.log("Starting speech recognition...");
            textBeforeRecordingRef.current = userAnswer;
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (!SpeechRecognition) {
                alert("Speech recognition not supported in this browser. Please use Chrome or Edge.");
                return;
            }
            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'en-US';

            recognition.onstart = () => {
                console.log("Speech recognition started.");
                setIsRecording(true);
            };

            recognition.onresult = (event) => {
                let speechTranscript = '';
                for (let i = 0; i < event.results.length; ++i) {
                    speechTranscript += event.results[i][0].transcript;
                }

                const initialText = textBeforeRecordingRef.current;
                const newText = initialText + (initialText && speechTranscript ? " " : "") + speechTranscript;
                setUserAnswer(newText);
            };

            recognition.onerror = (event) => {
                console.error("Speech recognition error:", event.error);
                if (event.error === 'not-allowed') {
                    alert("Microphone access denied. Please allow microphone permissions in your browser.");
                } else if (event.error === 'network') {
                    alert("Network error. Speech recognition requires an internet connection.");
                } else {
                    alert(`Speech recognition error: ${event.error}`);
                }
                setIsRecording(false);
            };

            recognition.onend = () => {
                console.log("Speech recognition ended.");
                setIsRecording(false);
            };

            try {
                recognition.start();
                recognitionRef.current = recognition;
            } catch (err) {
                console.error("Recognition start failed:", err);
            }
        }
    };

    useEffect(() => {
        const stopAudioOnVisibilityChange = () => {
            if (document.hidden && window.speechSynthesis) {
                window.speechSynthesis.cancel();
                setIsSpeaking(false);
            }
        };

        document.addEventListener('visibilitychange', stopAudioOnVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', stopAudioOnVisibilityChange);
            if (window.speechSynthesis) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    useEffect(() => {
        const hasQuestion = !!currentQuestion;
        const isAnswering = hasQuestion && !evaluationResult;

        if (!isAnswering) return;

        const handleVisibilityChange = () => {
            if (document.hidden) {
                setTabSwitches(prev => {
                    const newCount = prev + 1;
                    if (newCount >= 3) {
                        alert("Warning: Multiple tab switches detected. Please stay on this page.");
                    } else {
                        alert(`Warning: Tab switching is monitored. Warning ${newCount}/3`);
                    }
                    return newCount;
                });
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [currentQuestion, evaluationResult]);

    const submitUserAnswer = async () => {
        if (!userAnswer) return;
        setIsLoading(true);
        try {
            const response = await apiCall('/hr/submit', 'POST', {
                question: currentQuestion,
                answer: userAnswer,
            });
            setEvaluationResult(response);
        } catch (err) {
            alert(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const isWaitingForQuestion = isLoading && !currentQuestion && !evaluationResult;
    const hasQuestion = !!currentQuestion;
    const showAnswerForm = hasQuestion && !evaluationResult;
    const showFeedback = hasQuestion && !!evaluationResult;
    const showStartScreen = !hasQuestion && !isLoading;

    return (
        <main className="pt-20 pb-12 px-8 min-h-screen">
            <section className="flex-1 grid grid-cols-12 gap-8 max-w-[1440px] mx-auto w-full">

                <div className="col-span-12 lg:col-span-8 flex flex-col gap-8">
                    {showStartScreen && (
                        <div className="bg-surface-container-lowest rounded-2xl p-10 shadow-[0px_4px_20px_rgba(25,27,35,0.04)] border border-outline-variant/15 flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-primary-fixed rounded-xl flex items-center justify-center mb-6 shadow-sm">
                                <span className="material-symbols-outlined text-primary text-3xl">video_chat</span>
                            </div>
                            <h2 className="font-headline text-3xl font-extrabold text-on-surface leading-tight mb-3">Start Behavioral Mock</h2>
                            <p className="text-on-surface-variant text-base max-w-xl mb-8">Our virtual HR interviewer will ask you questions based on your resume.</p>
                            <button onClick={fetchNewQuestion} className="bg-gradient-to-br from-primary-container to-primary text-white px-8 py-3.5 rounded-full font-bold shadow-xl hover:shadow-primary/30 active:scale-[0.98] transition-all text-base">
                                Start My Mock Interview
                            </button>
                        </div>
                    )}

                    {isWaitingForQuestion && (
                        <div className="flex justify-center flex-col items-center h-48 bg-surface-container-lowest rounded-2xl border border-outline-variant/15 gap-3">
                            <span className="material-symbols-outlined text-primary text-3xl animate-spin duration-1000">sync</span>
                            <p className="font-bold text-base text-on-surface-variant font-headline">Generating question...</p>
                        </div>
                    )}

                    {hasQuestion && (
                        <>
                            <div className="bg-surface-container-lowest rounded-2xl p-8 shadow-sm border border-outline-variant/15 relative overflow-hidden">
                                <div className="font-headline text-xl font-bold text-on-surface leading-relaxed flex items-center justify-between">
                                    <span>Question:</span>
                                    <button
                                        onClick={() => speakText(currentQuestion, true)}
                                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isSpeaking ? 'bg-primary text-white animate-pulse' : 'bg-surface-container-high text-on-surface-variant'}`}
                                        title={isSpeaking ? "Stop Speaking" : "Speak Question"}
                                    >
                                        <span className="material-symbols-outlined">{isSpeaking ? 'volume_up' : 'volume_down'}</span>
                                    </button>
                                </div>
                                <h2 className="font-headline text-xl font-semibold text-on-surface leading-relaxed mt-2">"{currentQuestion}"</h2>
                            </div>

                            {showAnswerForm && (
                                <div className="bg-surface-container-lowest rounded-2xl p-8 flex flex-col gap-4 shadow-sm border border-outline-variant/15">
                                    <div>
                                        <h3 className="font-headline text-lg font-bold text-on-surface">Your Answer</h3>
                                    </div>
                                    <div className="flex flex-col gap-3">
                                        <div className="relative">
                                            <textarea
                                                className="w-full min-h-[220px] p-5 pb-16 bg-surface-container-high rounded-xl border-none focus:ring-2 focus:ring-primary/20 text-on-surface text-base leading-relaxed transition-all resize-none"
                                                placeholder="Type or speak your answer here..."
                                                value={userAnswer}
                                                onChange={(e) => setUserAnswer(e.target.value)}
                                                disabled={isLoading}
                                            ></textarea>
                                            <button
                                                onClick={toggleRecording}
                                                className={`absolute bottom-4 right-4 w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all z-10 ${isRecording ? 'bg-red-500 text-white animate-pulse scale-110' : 'bg-primary text-white hover:scale-105'}`}
                                                title={isRecording ? 'Stop Recording' : 'Start Recording'}
                                            >
                                                <span className="material-symbols-outlined">{isRecording ? 'mic_off' : 'mic'}</span>
                                            </button>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-on-surface-variant font-medium">{userAnswer.length} characters</span>
                                            <button
                                                onClick={submitUserAnswer}
                                                disabled={isLoading || !userAnswer}
                                                className={`bg-gradient-to-br from-primary-container to-primary text-white px-8 py-3 rounded-full font-bold shadow-lg text-sm flex items-center gap-2 transition-all active:scale-95 ${isLoading ? 'opacity-70' : 'hover:shadow-primary/30'}`}
                                            >
                                                {isLoading ? 'Evaluating...' : 'Submit Answer'}
                                                {!isLoading && <span className="material-symbols-outlined text-sm">send</span>}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {showFeedback && (
                                <div className="bg-surface-container-lowest rounded-2xl p-8 flex flex-col gap-4 shadow-sm border border-outline-variant/15">
                                    <div className="flex items-center gap-4 border-b border-outline-variant/20 pb-5">
                                        <div className="w-16 h-16 bg-green-100/50 rounded-xl flex items-center justify-center text-green-700 font-extrabold text-2xl shadow-sm border border-green-200">
                                            {evaluationResult.score}<span className="text-sm text-green-600/70 ml-0.5">/10</span>
                                        </div>
                                        <div>
                                            <h3 className="font-headline text-xl font-bold text-on-surface">Feedback</h3>
                                            <p className="text-on-surface-variant text-sm mt-0.5">Score and evaluation of your response.</p>
                                        </div>
                                    </div>

                                    <div className="text-on-surface text-base leading-relaxed whitespace-pre-wrap">
                                        {evaluationResult.feedback}
                                    </div>

                                    <div className="mt-4 flex justify-end gap-3">
                                        <button onClick={() => window.location.href = '/dashboard'} className="bg-surface-container text-on-surface px-6 py-2.5 rounded-full font-bold border border-outline-variant/10 text-sm">
                                            Dashboard
                                        </button>
                                        <button onClick={fetchNewQuestion} className="bg-primary text-white px-6 py-2.5 rounded-full font-bold shadow-lg text-sm">
                                            Next Question
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
                <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
                    <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/15 relative overflow-hidden shadow-sm">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl pointer-events-none"></div>

                        {/* Mock Settings Section */}
                        <div className="flex items-center gap-4 mb-6 relative">
                            <div className="w-14 h-14 bg-primary-fixed rounded-2xl flex items-center justify-center shadow-sm">
                                <span className="material-symbols-outlined text-on-primary-fixed text-3xl">settings_accessibility</span>
                            </div>
                            <div>
                                <h4 className="text-xl font-bold text-on-surface font-headline">Mock Settings</h4>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-xl mb-10 relative">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-primary">record_voice_over</span>
                                <span className="text-base font-bold text-on-surface">AI Voice Interview</span>
                            </div>
                            <button
                                onClick={() => setUseVoice(!useVoice)}
                                className={`w-12 h-6 rounded-full relative transition-all ${useVoice ? 'bg-primary' : 'bg-outline-variant'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${useVoice ? (window.innerWidth < 640 ? 'left-7' : 'left-7') : 'left-1'}`}></div>
                            </button>
                        </div>

                        {/* Mistakes Section */}
                        <div className="flex items-center gap-4 mb-10 relative">
                            <div className="w-14 h-14 bg-primary-fixed rounded-2xl flex items-center justify-center shadow-sm">
                                <span className="material-symbols-outlined text-on-primary-fixed text-3xl">lightbulb</span>
                            </div>
                            <div>
                                <h4 className="text-xl font-bold text-on-surface font-headline">Common Interview Mistakes</h4>
                            </div>
                        </div>

                        <div className="space-y-8 relative">
                            {[
                                { icon: 'crisis_alert', title: 'Talking too much', desc: "If you're still talking after 2 minutes, you've lost them. Practice keeping answers tight and to the point." },
                                { icon: 'sentiment_dissatisfied', title: 'Badmouthing past employers', desc: "Even if your last boss was terrible, keep it professional." },
                                { icon: 'help', title: 'Not asking any questions', desc: "No questions signals you're not that interested in the role. So to signal interest, try to ask 2-3 questions to the interviewer." },
                                { icon: 'volume_off', title: 'Underselling yourself', desc: "Being humble is great, but this isn't the time. Own your wins, make sure to tell them about your achievements and accomplishments." },
                            ].map((tip) => (
                                <div key={tip.icon} className="flex gap-5">
                                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-secondary-container flex items-center justify-center text-on-secondary-container shadow-sm border border-secondary-container/50">
                                        <span className="material-symbols-outlined text-xl">{tip.icon}</span>
                                    </div>
                                    <div>
                                        <h5 className="text-base font-bold mb-1 text-on-surface font-headline">{tip.title}</h5>
                                        <p className="text-sm text-on-surface-variant leading-relaxed">{tip.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </section>
        </main>
    );
}
