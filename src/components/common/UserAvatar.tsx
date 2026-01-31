
import React from 'react';

interface UserAvatarProps {
    avatarUrl?: string | null;
    username?: string | null;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}

export const UserAvatar = ({ avatarUrl, username, size = 'md', className = '' }: UserAvatarProps) => {

    // Size mapping
    const sizeClasses = {
        sm: 'w-8 h-8 text-xs',
        md: 'w-10 h-10 text-sm',
        lg: 'w-12 h-12 text-lg',
        xl: 'w-16 h-16 text-2xl',
    };

    const initial = username ? username.charAt(0).toUpperCase() : 'U';

    return (
        <div
            className={`
                rounded-2xl flex items-center justify-center font-black text-white shadow-lg overflow-hidden relative
                ${sizeClasses[size]}
                ${!avatarUrl ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-emerald-500/20' : ''}
                ${className}
            `}
        >
            {avatarUrl ? (
                <img
                    src={avatarUrl}
                    alt={username || 'User'}
                    className="w-full h-full object-cover"
                />
            ) : (
                <span className="select-none">{initial}</span>
            )}
        </div>
    );
};
