"use client";

import { useState, useEffect } from "react";

export function useProStatus() {
    const [isPro, setIsPro] = useState(false);

    useEffect(() => {
        const checkPro = async () => {
            const userToken = localStorage.getItem('userToken');
            const adminToken = localStorage.getItem('adminToken');
            const userDataStr = localStorage.getItem('userData');

            // 1. Silent Sync & Validation
            if (userToken || adminToken) {
                const token = adminToken || userToken;
                fetch('/api/users/profile', {
                    headers: { 'Authorization': `Bearer ${token}` }
                }).then(res => {
                    if (res.status === 401) {
                        // Token is invalid - clear everything
                        localStorage.removeItem('userToken');
                        localStorage.removeItem('userData');
                        localStorage.removeItem('adminToken');
                        setIsPro(false);
                        return null;
                    }
                    if (res.ok) return res.json();
                    return null;
                }).then(data => {
                    if (data) {
                        const proStatus = !!data.isPro || !!adminToken;
                        setIsPro(proStatus);
                        localStorage.setItem('userData', JSON.stringify(data));
                    }
                }).catch(() => {
                    // On network error or other issues, fallback to false if no cached data
                    if (!userDataStr) setIsPro(false);
                });
            }

            // 2. Initial check from local user data (optimistic UI)
            if (userDataStr) {
                try {
                    const parsed = JSON.parse(userDataStr);
                    setIsPro(!!parsed.isPro || !!adminToken);
                } catch (e) {
                    setIsPro(false);
                }
            } else {
                // No valid tokens found
                setIsPro(false);
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
