import { createServer } from './supabase/server';
import { Profile, Trade } from '@/types';

export async function getUserProfile(userId: string): Promise<Profile | null> {
    const supabase = await createServer();
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (error) {
        console.error('Error fetching profile:', error);
        return null;
    }

    return data;
}

export async function getUserActiveTrades(userId: string): Promise<Trade[]> {
    const supabase = await createServer();
    const { data, error } = await supabase
        .from('trades')
        .select(`
            *,
            offer:offers(platform, currency_code),
            partner:profiles!trades_seller_id_fkey(full_name) 
        `)
        .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
        .in('status', ['Pending', 'AwaitingPayment', 'Paid', 'AwaitingRelease', 'Disputed'])
        .order('created_at', { ascending: false });

    // Note: The above query assumes a relation 'offers' and joining with profiles to get partner name. 
    // We might need to adjust the query based on exact schema or do two fetches if relations aren't set up perfectly yet.
    // For now, simple fetch:

    // Simpler version if relations are complex to type immediately:
    /*
    const { data, error } = await supabase
        .from('trades')
        .select('*')
        .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
        .in('status', ['Pending', 'AwaitingPayment', 'Paid', 'AwaitingRelease', 'Disputed'])
        .order('created_at', { ascending: false });
    */

    if (error) {
        console.error('Error fetching trades:', error);
        return [];
    }

    return data || [];
}

export async function getAdminStats() {
    const supabase = await createServer();

    // Execute in parallel
    const [users, disputes, trades] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('disputes').select('*', { count: 'exact', head: true }).eq('status', 'Open'), // Assuming 'status' on disputes
        supabase.from('trades').select('amount_dzd') // fetching all to sum might be heavy, ideally use an RPC or edge function for aggregation
    ]);

    // Simple sum for demo purposes (production should use DB function)
    const totalVolume = trades.data?.reduce((acc, trade) => acc + (Number(trade.amount_dzd) || 0), 0) || 0;

    return {
        totalUsers: users.count || 0,
        activeDisputes: disputes.count || 0,
        totalVolume: totalVolume
    };
}

export async function getRecentDisputes() {
    const supabase = await createServer();
    const { data, error } = await supabase
        .from('disputes')
        .select(`
            *,
            trade:trades(
                amount_asset,
                buyer:profiles!trades_buyer_id_fkey(full_name),
                seller:profiles!trades_seller_id_fkey(full_name)
            )
        `)
        .order('created_at', { ascending: false })
        .limit(10);

    if (error) {
        console.error('Error fetching disputes:', error);
        return [];
    }

    return data || [];
}
