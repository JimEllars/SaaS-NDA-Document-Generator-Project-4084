import { useState, useEffect, useCallback } from 'react';

export const useAximAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        try {
            return sessionStorage.getItem('axim_auth_status') === 'true';
        } catch {
            return false;
        }
    });

    const [user, setUser] = useState(() => {
        try {
            const cachedUser = sessionStorage.getItem('axim_auth_user');
            return cachedUser ? JSON.parse(cachedUser) : null;
        } catch {
            return null;
        }
    });

    const checkAuth = useCallback(async () => {
        const cookies = document.cookie.split(';');
        const sessionCookie = cookies.find(c => c.trim().startsWith('axim_session='));

        if (sessionCookie) {
            try {
                // Call verification endpoint
                const res = await fetch('https://passport.axim.us.com/auth/verify', {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                    // In a real app we'd pass credentials: 'include' or similar to send cookies
                });
                if (res.ok) {
                    const data = await res.json();
                    const userData = {
                        email: data.email || 'user@example.com',
                        full_name: data.full_name || 'Enterprise User',
                        company: data.company || 'ACME Corp',
                        role: data.role || 'user'
                    };
                    setUser(userData);
                    setIsAuthenticated(true);
                    try {
                        sessionStorage.setItem('axim_auth_user', JSON.stringify(userData));
                        sessionStorage.setItem('axim_auth_status', 'true');
                    } catch (e) {
                        console.error('Session storage failed', e);
                    }
                } else {
                     // Fallback to cache if request fails but we have session state, otherwise clear
                     if (res.status === 401 || res.status === 403) {
                         setIsAuthenticated(false);
                         setUser(null);
                         try {
                             sessionStorage.removeItem('axim_auth_user');
                             sessionStorage.removeItem('axim_auth_status');
                         } catch(e) {
                             console.error("Session storage clear failed", e);
                         }
                     }
                }
            } catch (e) {
                console.error("Failed to verify axim_session cookie", e);
                // On network failure, retain cached authentication credentials if available
                // We rely on the initial state hydrated from sessionStorage
            }
        } else {
            setIsAuthenticated(false);
            setUser(null);
            try {
                sessionStorage.removeItem('axim_auth_user');
                sessionStorage.removeItem('axim_auth_status');
            } catch(e) {
                             console.error("Session storage clear failed", e);
                         }
        }
    }, []);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    const login = () => {
        window.location.href = `https://passport.axim.us.com/login?redirect_uri=${window.location.origin}/auth/callback&app_id=nda-generator`;
    };

    const logout = () => {
        // Mock logout logic
        document.cookie = 'axim_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.axim.us.com;';
        setIsAuthenticated(false);
        setUser(null);
        try {
            sessionStorage.removeItem('axim_auth_user');
            sessionStorage.removeItem('axim_auth_status');
        } catch(e) {
                             console.error("Session storage clear failed", e);
                         }
    };

    return { isAuthenticated, user, login, logout, checkAuth };
};
