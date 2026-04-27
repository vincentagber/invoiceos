'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { User as SupabaseUser } from '@supabase/supabase-js';

interface User {
    id: string;
    name: string;
    email: string;
    profilePicture?: string;
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
            setLoading(false);
        });

        // 2. Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            handleSessionUpdate(session);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleSessionUpdate = (session: any) => {
        setSession(session);
        if (session?.user) {
            const newToken = session.access_token;
            setToken(newToken);
            localStorage.setItem('token', newToken); // Sync for axios interceptor
            mapSupabaseUser(session.user);
        } else {
            setToken(null);
            setUser(null);
            localStorage.removeItem('token');
        }
    };

    const mapSupabaseUser = (sbUser: SupabaseUser) => {
        setUser({
            id: sbUser.id,
            email: sbUser.email || '',
            name: sbUser.user_metadata?.full_name || sbUser.email?.split('@')[0] || 'User',
            profilePicture: sbUser.user_metadata?.avatar_url
        });
    };

    const logout = async () => {
        await supabase.auth.signOut();
        localStorage.removeItem('token');
        localStorage.removeItem('user');
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
