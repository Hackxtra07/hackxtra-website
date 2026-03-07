"use client";

import { useState, useEffect } from "react";

export function useProStatus() {
    const [isPro, setIsPro] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const syncSession = async () => {
            const userToken = localStorage.getItem('userToken');
            const adminToken = localStorage.getItem('adminToken');
            const userDataStr = localStorage.getItem('userData');
            let token = adminToken || userToken;

            // 1. Auto-Login / Session Restore
            if (!token) {
                try {
                    const res = await fetch('/api/auth/session');
                    if (res.ok) {
                        const data = await res.json();
                        if (data.token) {
                            localStorage.setItem('userToken', data.token);
                            localStorage.setItem('userData', JSON.stringify(data.user));
                            setIsPro(!!data.user.isPro || data.user.role === 'admin');
                            setIsAuthenticated(true);
                            setIsLoading(false);
                            window.dispatchEvent(new Event('storage'));
                            return;
                        }
                    }
                } catch (e) { }
                setIsPro(false);
                setIsAuthenticated(false);
                setIsLoading(false);
                return;
            }

            // 2. Initial optimistic check from cache
            setIsAuthenticated(true);
            if (userDataStr) {
                try {
                    const parsed = JSON.parse(userDataStr);
                    setIsPro(!!parsed.isPro || !!adminToken);
                } catch (e) { }
            }
            setIsLoading(false);

            // 3. Silent Sync & Validation
            if (token) {
                fetch('/api/users/profile', {
                    headers: { 'Authorization': `Bearer ${token}` }
                }).then(res => {
                    if (res.status === 401) {
                        localStorage.removeItem('userToken');
                        localStorage.removeItem('userData');
                        localStorage.removeItem('adminToken');
                        setIsPro(false);
                        setIsAuthenticated(false);
                        return null;
                    }
                    if (res.ok) return res.json();
                    return null;
                }).then(data => {
                    if (data) {
                        const proStatus = !!data.isPro || !!adminToken || data.role === 'admin';
                        setIsPro(proStatus);
                        setIsAuthenticated(true);
                        localStorage.setItem('userData', JSON.stringify(data));
                    }
                }).catch(() => { });
            }
        };

        syncSession();

        const handleStorage = (e: StorageEvent) => {
            if (e.key === 'userData' || e.key === 'adminToken' || e.key === 'userToken') {
                syncSession();
            }
        };

        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    return { isPro, isAuthenticated, isLoading };
}
