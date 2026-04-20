import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ResumeUpload from './pages/ResumeUpload';
import McqTest from './pages/McqTest';
import AtsCheck from './pages/AtsCheck';
import HrMock from './pages/HrMock';

function Sidebar({ setIsAuthenticated }) {
  const loc = useLocation();
  const isActive = (path) => loc.pathname === path;

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 bg-surface-container-lowest flex flex-col py-8 px-4 z-50 border-r border-outline-variant/30">
      <div className="mb-10 px-4">
        <span className="text-xl font-bold tracking-tight text-on-surface brand-font">Interview Prep AI</span>
        <p className="text-xs text-on-surface-variant mt-1">Your Personal Interview Coach</p>
      </div>
      <nav className="flex-1 space-y-2">
        <Link to="/dashboard" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive('/dashboard') ? 'bg-primary-fixed text-primary-fixed-variant font-bold' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/50 font-semibold'}`}>
          <span className="material-symbols-outlined">dashboard</span>
          <span className="text-sm">Dashboard</span>
        </Link>
        <Link to="/resume-upload" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive('/resume-upload') ? 'bg-primary-fixed text-primary-fixed-variant font-bold' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/50 font-semibold'}`}>
          <span className="material-symbols-outlined">description</span>
          <span className="text-sm">Resume</span>
        </Link>
        <Link to="/mcq" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive('/mcq') ? 'bg-primary-fixed text-primary-fixed-variant font-bold' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/50 font-semibold'}`}>
          <span className="material-symbols-outlined">quiz</span>
          <span className="text-sm">MCQ Tests</span>
        </Link>
        <Link to="/ats-check" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive('/ats-check') ? 'bg-primary-fixed text-primary-fixed-variant font-bold' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/50 font-semibold'}`}>
          <span className="material-symbols-outlined">rule</span>
          <span className="text-sm">ATS Analyzer</span>
        </Link>
        <Link to="/hr-interview" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive('/hr-interview') ? 'bg-primary-fixed text-primary-fixed-variant font-bold' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/50 font-semibold'}`}>
          <span className="material-symbols-outlined">video_chat</span>
          <span className="text-sm">Mock Interview</span>
        </Link>
      </nav>

      <div className="mt-auto pt-6 border-t border-outline-variant/30 space-y-2 px-2">
        <button className="w-full bg-error-container text-on-error-container rounded-xl py-3 px-4 mb-4 font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90" onClick={() => {
          localStorage.removeItem('access_token');
          setIsAuthenticated(false);
          window.location.href = '/login';
        }}>
          Logout
        </button>
      </div>
    </aside>
  );
}

function MainApp({ setIsAuthenticated }) {
  return (
    <>
      <Sidebar setIsAuthenticated={setIsAuthenticated} />

      <header className="fixed top-0 right-0 w-[calc(100%-16rem)] z-40 bg-surface/80 backdrop-blur-md flex justify-between items-center h-16 px-8 shadow-sm">
        <h2 className="text-xl font-headline font-bold text-on-surface">Application Center</h2>
        <div className="flex items-center gap-4">
          <button className="p-2 text-on-surface-variant hover:bg-surface-variant rounded-full transition-colors relative">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full"></span>
          </button>
          <button className="p-2 text-on-surface-variant hover:bg-surface-variant rounded-full transition-colors">
            <span className="material-symbols-outlined">account_circle</span>
          </button>
        </div>
      </header>

      <div className="ml-64 relative min-h-screen bg-background">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/resume-upload" element={<ResumeUpload />} />
          <Route path="/mcq" element={<McqTest />} />
          <Route path="/ats-check" element={<AtsCheck />} />
          <Route path="/hr-interview" element={<HrMock />} />
        </Routes>
      </div>
    </>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('access_token'));

  return (
    <BrowserRouter>
      {isAuthenticated ? (
        <MainApp setIsAuthenticated={setIsAuthenticated} />
      ) : (
        <Routes>
          <Route path="*" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login setAuth={setIsAuthenticated} />} />
        </Routes>
      )}
    </BrowserRouter>
  );
}

export default App;
