import React from 'react';
import { ProfileView } from '@/components/profile/ProfileView';


export default async function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return (
        <div className="min-h-screen pt-32 pb-24 bg-slate-50">
            <ProfileView userId={id} />
        </div>
    );
}
