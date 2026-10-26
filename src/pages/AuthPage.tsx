import { useState } from 'react';
import { Film, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthPageProps {
    onSuccess: () => void;
}

// ── SVG brand icons ────────────────────────────────────────────────────────────
function GoogleIcon() {
    return (
        <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
    );
}



// ── Divider ────────────────────────────────────────────────────────────────────
function Divider() {
    return (
        <div className="relative flex items-center my-5">
            <div className="flex-grow border-t border-gray-700/60" />
            <span className="mx-4 text-gray-500 text-xs font-medium flex-shrink-0">or continue with</span>
            <div className="flex-grow border-t border-gray-700/60" />
        </div>
    );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function AuthPage({ onSuccess }: AuthPageProps) {
    const { login, signup, loginWithOAuth, oauthLoading } = useAuth();
    const [mode, setMode] = useState<'login' | 'signup'>('login');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        setLoading(true);
        let err: string | null;
        if (mode === 'login') {
            err = await login(email, password);
        } else {
            err = await signup(name, email, password);
        }
        if (err) {
            setLoading(false);
            setError(err);
            return;
        }
        if (mode === 'login') {
            window.setTimeout(() => {
                setLoading(false);
                onSuccess();
            }, 2000);
        } else {
            setLoading(false);
            onSuccess();
        }
    }

    async function handleOAuth(provider: 'google' | 'facebook') {
        setError('');
        const err = await loginWithOAuth(provider);
        if (err) setError(err);
        // If no error, the page will redirect to OAuth provider.
        // On return, onAuthStateChange in AuthContext picks up the session.
    }

    function switchMode() {
        setMode((m) => (m === 'login' ? 'signup' : 'login'));
        setError('');
        setName('');
        setEmail('');
        setPassword('');
    }

    const isAnyLoading = loading || oauthLoading;

    return (
        <div className="min-h-screen bg-gray-950 pt-16 flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl shadow-black/40">

                    {/* Logo */}
                    <div className="flex items-center justify-center gap-2 mb-8">
                        <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                            <Film size={22} className="text-gray-950" />
                        </div>
                        <span className="text-white font-black text-2xl tracking-tight">
                            Cine<span className="text-amber-400">Vista</span>
                        </span>
                    </div>

                    <h2 className="text-white font-bold text-xl text-center mb-1">
                        {mode === 'login' ? 'Welcome back' : 'Create your account'}
                    </h2>
                    <p className="text-gray-500 text-sm text-center mb-6">
                        {mode === 'login'
                            ? 'Sign in to book your favourite movies'
                            : 'Join CineVista for a premium cinema experience'}
                    </p>

                    {/* ── Social Login Buttons ── */}
                    <div className="mb-1">
                        <button
                            type="button"
                            id="google-auth-btn"
                            onClick={() => handleOAuth('google')}
                            disabled={isAnyLoading}
                            className="w-full flex items-center justify-center gap-2.5 bg-white hover:bg-gray-100 disabled:opacity-60 text-gray-800 font-semibold py-2.5 px-4 rounded-xl transition-all duration-200 border border-gray-200 shadow-sm text-sm"
                        >
                            {oauthLoading ? (
                                <Loader2 size={16} className="animate-spin text-gray-500" />
                            ) : (
                                <GoogleIcon />
                            )}
                            Continue with Google
                        </button>
                    </div>

                    <Divider />

                    {/* ── Email / Password Form ── */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {mode === 'signup' && (
                            <div>
                                <label className="block text-gray-400 text-xs font-medium mb-1.5 uppercase tracking-wide">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Your Name"
                                    required
                                    className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-600 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 transition-colors"
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-gray-400 text-xs font-medium mb-1.5 uppercase tracking-wide">
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                required
                                className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-600 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-400 text-xs font-medium mb-1.5 uppercase tracking-wide">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPw ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder={mode === 'signup' ? 'At least 6 characters' : '••••••••'}
                                    required
                                    className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-600 rounded-xl px-4 py-2.5 pr-10 text-sm focus:outline-none focus:border-amber-500 transition-colors"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPw((v) => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                                >
                                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-2.5">
                                <p className="text-red-400 text-sm">{error}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            id="auth-submit-btn"
                            disabled={isAnyLoading}
                            className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-gray-950 font-bold py-3 rounded-xl transition-colors mt-2"
                        >
                            {loading
                                ? mode === 'login'
                                    ? (<span className="inline-flex items-center justify-center gap-2">
                                        <span className="h-2.5 w-2.5 rounded-full bg-gray-950 animate-pulse" />
                                        Logging in...
                                      </span>)
                                    : 'Please wait...'
                                : mode === 'login'
                                    ? 'Sign In'
                                    : 'Create Account'}
                        </button>
                    </form>

                    <p className="text-gray-500 text-sm text-center mt-6">
                        {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
                        <button onClick={switchMode} className="text-amber-400 hover:text-amber-300 font-medium transition-colors">
                            {mode === 'login' ? 'Sign up' : 'Sign in'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}
