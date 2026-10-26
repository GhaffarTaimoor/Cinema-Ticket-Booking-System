import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User } from '../types';
import { getUserByEmail, createUser, upsertOAuthUser } from '../lib/storage';
import { supabase } from '../lib/supabase';

interface AuthContextValue {
    user: User | null;
    login: (email: string, password: string) => Promise<string | null>;
    signup: (name: string, email: string, password: string) => Promise<string | null>;
    loginWithOAuth: (provider: 'google' | 'facebook') => Promise<string | null>;
    logout: () => void;
    notification: string | null;
    clearNotification: () => void;
    oauthLoading: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const SESSION_KEY = 'cinevista_session';

export function AuthProvider({ children }: {
    children: ReactNode;
}) {
    const [user, setUser] = useState<User | null>(() => {
        const raw = sessionStorage.getItem(SESSION_KEY);
        return raw ? JSON.parse(raw) : null;
    });
    const [notification, setNotification] = useState<string | null>(null);
    const [oauthLoading, setOauthLoading] = useState(false);

    useEffect(() => {
        if (user)
            sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
        else
            sessionStorage.removeItem(SESSION_KEY);
    }, [user]);

    // Listen for Supabase OAuth redirect callback
    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.user) {
                const supaUser = session.user;
                const email = supaUser.email ?? '';
                const name =
                    supaUser.user_metadata?.full_name ||
                    supaUser.user_metadata?.name ||
                    email.split('@')[0];

                try {
                    const appUser = await upsertOAuthUser(email, name);
                    setUser(appUser);
                    setNotification('Logged in');
                } catch (err) {
                    console.error('OAuth upsert failed:', err);
                } finally {
                    setOauthLoading(false);
                }
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    async function login(email: string, password: string): Promise<string | null> {
        const found = await getUserByEmail(email);
        if (!found)
            return 'No account found with that email.';
        if (!found.password)
            return 'This account was created with Google or Facebook. Please use social login.';
        if (found.password !== password)
            return 'Incorrect password.';
        setUser(found);
        setNotification('Logged in');
        return null;
    }

    async function signup(name: string, email: string, password: string): Promise<string | null> {
        if (await getUserByEmail(email))
            return 'An account with that email already exists.';
        if (password.length < 6)
            return 'Password must be at least 6 characters.';
        const newUser = await createUser({ name, email, password });
        setUser(newUser);
        return null;
    }

    async function loginWithOAuth(provider: 'google' | 'facebook'): Promise<string | null> {
        setOauthLoading(true);

        const currentPath = window.location.pathname || '/FYP/';
        const redirectTo = `${window.location.origin}${currentPath}`;

        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo,
                },
            });

            if (error) {
                setOauthLoading(false);
                return error.message;
            }

            return null;
        } catch (err: any) {
            setOauthLoading(false);
            return err.message ?? 'OAuth login failed.';
        }
    }

    function logout() {
        supabase.auth.signOut().catch(console.error);
        setUser(null);
    }

    function clearNotification() {
        setNotification(null);
    }

    return (<AuthContext.Provider value={{ user, login, signup, loginWithOAuth, logout, notification, clearNotification, oauthLoading }}>
      {children}
    </AuthContext.Provider>);
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx)
        throw new Error('useAuth must be used inside AuthProvider');
    return ctx;
}
