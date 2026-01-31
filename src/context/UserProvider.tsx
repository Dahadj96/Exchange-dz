
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase/client';
import { Session, AuthChangeEvent } from '@supabase/supabase-js';

interface Profile {
    id: string;
    username: string;
    full_name?: string;
    avatar_url?: string;
    email?: string;
}

interface UserContextType {
    user: any | null;
    profile: Profile | null;
    isLoading: boolean;
    refreshProfile: () => Promise<void>;
}

const UserContext = createContext<UserContextType>({
    user: null,
    profile: null,
    isLoading: true,
    refreshProfile: async () => { },
});

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchProfile = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) {
                console.error('Error fetching profile:', error);
                return;
            }

            if (data) {
                setProfile(data);
            }
        } catch (err) {
            console.error('Unexpected error fetching profile:', err);
        }
    };

    useEffect(() => {
        const initializeAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user ?? null);

            if (session?.user) {
                await fetchProfile(session.user.id);
            }
            setIsLoading(false);
        };

        initializeAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event: AuthChangeEvent, session: Session | null) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                await fetchProfile(session.user.id);
            } else {
                setProfile(null);
            }
            setIsLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const refreshProfile = async () => {
        if (user) {
            await fetchProfile(user.id);
        }
    };

    return (
        <UserContext.Provider value={{ user, profile, isLoading, refreshProfile }}>
            {children}
        </UserContext.Provider>
    );
};
