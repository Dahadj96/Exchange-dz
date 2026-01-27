import React from 'react';
import { createServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation'; // In case we want to protect this route
import { getAdminStats, getRecentDisputes } from '@/lib/data';
import AdminDashboardClient from './AdminDashboardClient';

export default async function AdminDashboard() {
    // TODO: Add admin role check here

    const stats = await getAdminStats();
    const recentDisputes = await getRecentDisputes();

    return (
        <AdminDashboardClient
            stats={stats}
            recentDisputes={recentDisputes}
        />
    );
}
