'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { User as SupabaseUser } from '@supabase/supabase-js';

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
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<any | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // 1. Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            handleSessionUpdate(session);
        });

        // 2. Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            handleSessionUpdate(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleSessionUpdate = async (session: any) => {
        setSession(session);
        if (session?.user) {
            const newToken = session.access_token;
            setToken(newToken);
            localStorage.setItem('token', newToken);
            
            try {
                // Fetch organizations for the user
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
                
                // Fallback: Set user with no organizations so the app doesn't crash
                setUser({
                    id: session.user.id,
                    email: session.user.email || '',
                    name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
                    profilePicture: session.user.user_metadata?.avatar_url,
                    organizations: []
                });
            }
        } else {
            setToken(null);
            setUser(null);
            localStorage.removeItem('token');
        }
        setLoading(false);
    };

    const logout = async () => {
        await supabase.auth.signOut();
        localStorage.removeItem('token');
        setUser(null);
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, session, token, logout, loading }}>
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
