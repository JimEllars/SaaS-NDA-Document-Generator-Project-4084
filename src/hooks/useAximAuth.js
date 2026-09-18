import { useState, useEffect, useCallback } from 'react';

export const useAximAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);

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
                    setUser({
                        email: data.email || 'user@example.com',
                        full_name: data.full_name || 'Enterprise User',
                        company: data.company || 'ACME Corp',
                        role: data.role || 'user'
                    });
                    setIsAuthenticated(true);
                } else {
                     setIsAuthenticated(false);
                     setUser(null);
                }
            } catch (e) {
                console.error("Failed to verify axim_session cookie", e);
                setIsAuthenticated(false);
                setUser(null);
            }
        } else {
            setIsAuthenticated(false);
            setUser(null);
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
    };

    return { isAuthenticated, user, login, logout, checkAuth };
};
