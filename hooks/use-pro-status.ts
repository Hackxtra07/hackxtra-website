"use client";

import { useState, useEffect } from "react";

export function useProStatus() {
    const [isPro, setIsPro] = useState(false);

    useEffect(() => {
        const checkPro = async () => {
            const userToken = localStorage.getItem('userToken');
            const adminToken = localStorage.getItem('adminToken');
            const userDataStr = localStorage.getItem('userData');

            // 1. Admins are always treated as Pro for UI preview
            if (adminToken) {
                setIsPro(true);
                return;
            }

            // 2. Check local user data
            if (userDataStr) {
                try {
                    const parsed = JSON.parse(userDataStr);
                    setIsPro(!!parsed.isPro);

                    // 3. Silent Sync if user token exists (but don't block the UI)
                    if (userToken) {
                        fetch('/api/users/profile', {
                            headers: { 'Authorization': `Bearer ${userToken}` }
                        }).then(res => {
                            if (res.ok) return res.json();
                        }).then(data => {
                            if (data && data.isPro !== parsed.isPro) {
                                setIsPro(data.isPro);
                                localStorage.setItem('userData', JSON.stringify(data));
                            }
                        }).catch(() => { });
                    }
                } catch (e) {
                    setIsPro(false);
                }
            }
        };

        checkPro();

        // Secondary sync: listen for storage events from other tabs
        const handleStorage = (e: StorageEvent) => {
            if (e.key === 'userData' || e.key === 'adminToken' || e.key === 'userToken') {
                checkPro();
            }
        };

        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    return isPro;
}
