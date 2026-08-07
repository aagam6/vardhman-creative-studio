import React, { useEffect } from 'react';
import { contactConfig } from '@/lib/contactConfig';

export default function PVCLiveRedirect() {
    useEffect(() => {
        window.location.replace(contactConfig.liveRedirectUrl);
    }, []);

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#040b14] text-white">
            <div className="flex flex-col items-center gap-4 text-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#ff9933] border-t-transparent"></div>
                <h1 className="text-xl font-bold tracking-wide">Redirecting to YouTube / यूट्यूब पर रीडायरेक्ट किया जा रहा है...</h1>
                <p className="text-sm text-white/50">
                    If you are not redirected automatically,{' '}
                    <a href={contactConfig.liveRedirectUrl} className="text-[#ff9933] underline font-bold">
                        click here
                    </a>.
                </p>
            </div>
        </div>
    );
}
