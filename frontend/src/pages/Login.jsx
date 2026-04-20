import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiCall } from '../api';

export default function Login({ setAuth }) {
    const [isLoginMode, setIsLoginMode] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMessage(null);

        const endpoint = isLoginMode ? '/auth/login' : '/auth/signup';
        const payload = isLoginMode
            ? { email, password }
            : { email, password, name };

        try {
            const response = await apiCall(endpoint, 'POST', payload);
            localStorage.setItem('access_token', response.tokens.access);
            setAuth(true);
            navigate('/dashboard');
        } catch (err) {
            setErrorMessage(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleMode = () => {
        setIsLoginMode(!isLoginMode);
        setErrorMessage(null);
    };

    const submitLabel = isLoading
        ? 'Processing...'
        : isLoginMode ? 'Log In' : 'Sign Up';

    const switchPrompt = isLoginMode
        ? "Don't have an account? "
        : "Already have an account? ";

    const switchLabel = isLoginMode ? "Sign up for free" : "Log in";

    return (
        <>
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="ai-pulse-aura absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full opacity-40"></div>
                <div className="ai-pulse-aura absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] rounded-full opacity-40"></div>
            </div>

            <main className="relative z-10 min-h-screen flex items-center justify-center p-6 md:p-12">
                <div className="w-full max-w-[480px]">

                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center p-3 rounded-xl bg-surface-container-low mb-6">
                            <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>architecture</span>
                        </div>
                        <h1 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface mb-2">Interview Prep AI</h1>
                        <p className="text-on-surface-variant font-medium">The Methodical Architect of your career path.</p>
                    </div>

                    <div className="bg-surface-container-lowest rounded-xl p-8 md:p-10 shadow-[0px_4px_20px_rgba(25,27,35,0.04),0px_12px_40px_rgba(25,27,35,0.08)]">

                        {errorMessage && (
                            <div className="mb-6 p-4 rounded-xl bg-error-container text-on-error-container text-sm font-semibold">
                                {errorMessage}
                            </div>
                        )}

                        <form className="space-y-6" onSubmit={handleSubmit}>
                            {!isLoginMode && (
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-on-surface-variant ml-1">Full Name</label>
                                    <input
                                        className="w-full bg-surface-container-low border-0 rounded-xl px-4 py-4 focus:ring-2 focus:ring-surface-tint/20 focus:bg-surface-container-lowest transition-all duration-200 placeholder:text-outline"
                                        placeholder="John Doe" type="text"
                                        value={name} onChange={e => setName(e.target.value)} required
                                    />
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-on-surface-variant ml-1" htmlFor="email">Email Address</label>
                                <input
                                    className="w-full bg-surface-container-low border-0 rounded-xl px-4 py-4 focus:ring-2 focus:ring-surface-tint/20 focus:bg-surface-container-lowest transition-all duration-200 placeholder:text-outline"
                                    id="email" placeholder="name@architect.com" type="email"
                                    value={email} onChange={e => setEmail(e.target.value)} required
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center ml-1">
                                    <label className="text-sm font-semibold text-on-surface-variant" htmlFor="password">Password</label>
                                    {isLoginMode && <a className="text-xs font-bold text-primary hover:text-surface-tint transition-colors" href="#">Forgot?</a>}
                                </div>
                                <input
                                    className="w-full bg-surface-container-low border-0 rounded-xl px-4 py-4 focus:ring-2 focus:ring-surface-tint/20 focus:bg-surface-container-lowest transition-all duration-200 placeholder:text-outline"
                                    id="password" placeholder="••••••••" type="password"
                                    value={password} onChange={e => setPassword(e.target.value)} required
                                />
                            </div>

                            <button
                                className="w-full primary-gradient text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl hover:scale-[0.99] transition-all duration-200 active:scale-95 flex items-center justify-center gap-2"
                                type="submit" disabled={isLoading}
                            >
                                {submitLabel}
                            </button>
                        </form>
                    </div>

                    <p className="text-center mt-8 text-on-surface-variant font-medium">
                        {switchPrompt}
                        <button className="text-primary font-bold hover:underline underline-offset-4 decoration-2" onClick={toggleMode}>
                            {switchLabel}
                        </button>
                    </p>
                </div>
            </main>
        </>
    );
}
