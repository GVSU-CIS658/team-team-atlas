import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../../../lib/api';

interface User {
    id: string;
    email: string;
    username: string;
}

interface AuthContextValue {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (username: string, email: string, password: string, university?: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function decodeToken(token: string): User | null {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return { id: payload.id, email: payload.email, username: payload.username };
    } catch {
        return null;
    }
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            setUser(decodeToken(token));
        }
        setIsLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        const data = await api.post<{ accessToken: string; expiresIn: number }>(
            '/auth/login',
            { email, password },
        );
        localStorage.setItem('accessToken', data.accessToken);
        setUser(decodeToken(data.accessToken));
    };

    const register = async (username: string, email: string, password: string, university?: string) => {
        await api.post('/auth/register', { username, email, password, university });
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout', {});
        } finally {
            localStorage.removeItem('accessToken');
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
