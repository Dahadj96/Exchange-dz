
import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase/client';

export interface PaymentMethod {
    id: string;
    user_id: string;
    provider: 'CCP' | 'BaridiMob' | 'Wise' | 'Paysera';
    account_identifier: string; // RIP, Email, etc.
    is_default?: boolean;
    created_at?: string;
}

export const usePaymentMethods = (userId: string) => {
    const [methods, setMethods] = useState<PaymentMethod[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (userId) fetchMethods();
    }, [userId]);

    const fetchMethods = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('payment_methods')
                .select('*')
                .eq('user_id', userId)
                .order('is_default', { ascending: false });

            if (error) throw error;
            setMethods(data || []);
        } catch (err: any) {
            console.error('Error fetching payment methods:', err.message);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const addMethod = async (method: Omit<PaymentMethod, 'id' | 'user_id' | 'created_at'>) => {
        try {
            // Ensure we strictly only send known fields to avoid "column not found" errors
            const payload = {
                user_id: userId,
                provider: method.provider,
                account_identifier: method.account_identifier,
                is_default: method.is_default || false
            };

            const { data, error } = await supabase
                .from('payment_methods')
                .insert([payload])
                .select()
                .single();

            if (error) throw error;
            setMethods(prev => [...prev, data]);
            return { data, error: null };
        } catch (err: any) {
            return { data: null, error: err };
        }
    };

    const deleteMethod = async (id: string) => {
        try {
            const { error } = await supabase
                .from('payment_methods')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setMethods(prev => prev.filter(m => m.id !== id));
            return { error: null };
        } catch (err: any) {
            return { error: err };
        }
    };

    return {
        methods,
        loading,
        error,
        addMethod,
        deleteMethod,
        refresh: fetchMethods
    };
};
