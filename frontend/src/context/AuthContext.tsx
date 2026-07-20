'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { localAuth, LocalSession } from '@/lib/localAuth';
import { useRouter } from 'next/navigation';

interface Organization {
    id: string;
    name: string;
    role: string;
}

interface User {
    id: string;
    name: string;
    email: string;
    profilePicture?: string;
    organizations: Organization[];
}

interface AuthContextType {
    user: User | null;
    session: any | null;
    token: string | null;
    logout: (reason?: string) => void;
    refreshUser: () => Promise<void>;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<any | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const handleLocalSession = async (localSession: LocalSession) => {
        const newToken = localSession.access_token;
        setToken(newToken);
        setSession(localSession);
        localStorage.setItem('token', newToken);

        const orgs = (localSession.user.businesses || []).map((b: any) => ({
            id: b.id,
            name: b.name,
            role: 'OWNER',
        }));

        setUser({
            id: localSession.user.id,
            email: localSession.user.email || '',
            name: localSession.user.user_metadata?.full_name || localSession.user.email?.split('@')[0] || 'User',
            profilePicture: localSession.user.user_metadata?.avatar_url,
            organizations: orgs,
        });
        setLoading(false);
    };

    const refreshUser = async () => {
        if (isSupabaseConfigured()) {
            const { data: { session: currentSession } } = await supabase.auth.getSession();
            if (currentSession) {
                await handleSessionUpdate(currentSession);
            }
        } else {
            const { data: { session: localSession } } = localAuth.getSession();
            if (localSession) {
                await handleLocalSession(localSession);
            } else {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        if (isSupabaseConfigured()) {
            supabase.auth.getSession().then(({ data: { session } }) => {
                handleSessionUpdate(session);
            });

            const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
                handleSessionUpdate(session);
            });

            const handleGlobalLogout = (e: any) => {
                const reason = e.detail?.reason || 'session_expired';
                logout(reason);
            };
            window.addEventListener('invoiceos-logout', handleGlobalLogout);

            return () => {
                subscription.unsubscribe();
                window.removeEventListener('invoiceos-logout', handleGlobalLogout);
            };
        } else {
            const { data: { session: localSession } } = localAuth.getSession();
            if (localSession) {
                handleLocalSession(localSession);
            } else {
                setLoading(false);
            }

            const handleGlobalLogout = (e: any) => {
                const reason = e.detail?.reason || 'session_expired';
                logout(reason);
            };
            window.addEventListener('invoiceos-logout', handleGlobalLogout);

            return () => {
                window.removeEventListener('invoiceos-logout', handleGlobalLogout);
            };
        }
    }, []);

    const handleSessionUpdate = async (session: any) => {
        setSession(session);
        if (session?.user) {
            const newToken = session.access_token;
            setToken(newToken);
            localStorage.setItem('token', newToken);

            if (isSupabaseConfigured()) {
                try {
                    const { data: memberships, error: orgError } = await supabase
                        .from('organization_members')
                        .select('role, organizations(id, name)')
                        .eq('user_id', session.user.id);

                    if (orgError) {
                        console.error("Supabase Query Error Detected!");
                        console.error("Message:", orgError.message);
                        console.error("Code:", orgError.code);
                        console.error("Details:", orgError.details);
                        throw orgError;
                    }

                    const orgs = (memberships || []).map((m: any) => ({
                        id: m.organizations.id,
                        name: m.organizations.name,
                        role: m.role
                    }));

                    setUser({
                        id: session.user.id,
                        email: session.user.email || '',
                        name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
                        profilePicture: session.user.user_metadata?.avatar_url,
                        organizations: orgs
                    });
                } catch (err: any) {
                    console.error("Critical Auth Context Error:", err);

                    setUser({
                        id: session.user.id,
                        email: session.user.email || '',
                        name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
                        profilePicture: session.user.user_metadata?.avatar_url,
                        organizations: []
                    });
                }
            } else {
                const orgs = (session.user.businesses || []).map((b: any) => ({
                    id: b.id,
                    name: b.name,
                    role: 'OWNER',
                }));
                setUser({
                    id: session.user.id,
                    email: session.user.email || '',
                    name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
                    organizations: orgs,
                });
            }
        } else {
            setToken(null);
            setUser(null);
            localStorage.removeItem('token');
        }
        setLoading(false);
    };

    const logout = async (reason?: string) => {
        if (isSupabaseConfigured()) {
            await supabase.auth.signOut();
        } else {
            await localAuth.signOut();
        }
        localStorage.removeItem('token');
        setUser(null);
        setToken(null);
        setSession(null);

        const redirectUrl = reason ? `/login?error=${reason}` : '/login';
        router.push(redirectUrl);
    };

    return (
        <AuthContext.Provider value={{ user, session, token, logout, refreshUser, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
