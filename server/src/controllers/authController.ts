import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest, JwtPayload } from '../types';
import { supabase } from '../config/db';

const COOKIE_NAME = 'campusfit_rt';
const ACCESS_TOKEN_EXPIRY = 900; // 15 minutes in seconds
const REFRESH_TOKEN_EXPIRY = '7d';

const isProduction = process.env.NODE_ENV === 'production';

function signAccessToken(payload: JwtPayload): string {
    return jwt.sign(payload, process.env.JWT_ACCESS_SECRET!, { expiresIn: ACCESS_TOKEN_EXPIRY });
}

function signRefreshToken(payload: JwtPayload): string {
    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, { expiresIn: REFRESH_TOKEN_EXPIRY });
}

function setRefreshCookie(res: Response, token: string): void {
    res.cookie(COOKIE_NAME, token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        path: '/api/v1/auth/refresh',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
    });
}

// POST /auth/register
export const register = async (req: Request, res: Response): Promise<void> => {
    const { username, email, password, university } = req.body;

    if (!username || !email || !password) {
        res.status(400).json({
            success: false,
            error: {
                code: 'VALIDATION_ERROR',
                message: 'username, email, and password are required',
            },
        });
        return;
    }

    if (!email.endsWith('.edu')) {
        res.status(400).json({
            success: false,
            error: {
                code: 'VALIDATION_ERROR',
                message: 'A valid university email (.edu) is required',
                details: [{ field: 'email', reason: 'must be a valid .edu address' }],
            },
        });
        return;
    }

    const { data: existing } = await supabase
        .from('users')
        .select('id')
        .eq('email', email.toLowerCase())
        .single();

    if (existing) {
        res.status(409).json({ success: false, error: { code: 'CONFLICT', message: 'An account with this email already exists' } });
        return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const trimmedUniversity = typeof university === 'string' ? university.trim() : '';

    const { data: user, error } = await supabase
        .from('users')
        .insert({
            username,
            email: email.toLowerCase(),
            password_hash: hashedPassword,
            university: trimmedUniversity || null,
        })
        .select('id, username, email, university, created_at')
        .single();

    if (error || !user) {
        res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create account' } });
        return;
    }

    res.status(201).json({
        success: true,
        data: {
            id: user.id,
            username: user.username,
            email: user.email,
            university: user.university,
            createdAt: user.created_at,
        },
    });
};

// POST /auth/login
export const login = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400).json({
            success: false,
            error: { code: 'VALIDATION_ERROR', message: 'email and password are required' },
        });
        return;
    }

    const { data: user } = await supabase
        .from('users')
        .select('id, username, email, password_hash')
        .eq('email', email.toLowerCase())
        .single();

    if (!user) {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid email or password' } });
        return;
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid email or password' } });
        return;
    }

    const tokenPayload: JwtPayload = { id: user.id, email: user.email, username: user.username };
    const accessToken = signAccessToken(tokenPayload);
    const refreshToken = signRefreshToken(tokenPayload);

    await supabase
        .from('users')
        .update({ refresh_token: await bcrypt.hash(refreshToken, 10) })
        .eq('id', user.id);

    setRefreshCookie(res, refreshToken);

    res.status(200).json({
        success: true,
        data: { accessToken, expiresIn: ACCESS_TOKEN_EXPIRY },
    });
};

// POST /auth/refresh
export const refresh = async (req: Request, res: Response): Promise<void> => {
    const token = req.cookies?.[COOKIE_NAME];

    if (!token) {
        res.status(401).json({
            success: false,
            error: { code: 'UNAUTHORIZED', message: 'Refresh token missing' },
        });
        return;
    }

    let payload: JwtPayload;
    try {
        payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as JwtPayload;
    } catch {
        res.status(401).json({
            success: false,
            error: { code: 'UNAUTHORIZED', message: 'Invalid or expired refresh token' },
        });
        return;
    }

    const { data: user } = await supabase
        .from('users')
        .select('refresh_token')
        .eq('id', payload.id)
        .single();

    if (!user?.refresh_token) {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid or expired refresh token' } });
        return;
    }

    const valid = await bcrypt.compare(token, user.refresh_token);
    if (!valid) {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid or expired refresh token' } });
        return;
    }

    const tokenPayload: JwtPayload = { id: payload.id, email: payload.email, username: payload.username };
    const newAccessToken = signAccessToken(tokenPayload);
    const newRefreshToken = signRefreshToken(tokenPayload);

    await supabase
        .from('users')
        .update({ refresh_token: await bcrypt.hash(newRefreshToken, 10) })
        .eq('id', payload.id);

    setRefreshCookie(res, newRefreshToken);

    res.status(200).json({
        success: true,
        data: { accessToken: newAccessToken, expiresIn: ACCESS_TOKEN_EXPIRY },
    });
};

// POST /auth/logout
export const logout = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const token = req.cookies?.[COOKIE_NAME];

    if (token) {
        try {
            const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as JwtPayload;
            await supabase.from('users').update({ refresh_token: null }).eq('id', payload.id);
        } catch { /* token already invalid, no-op */ }
    }

    res.clearCookie(COOKIE_NAME, { path: '/api/v1/auth/refresh' });

    res.status(200).json({
        success: true,
        data: { message: 'Logged out' },
    });
};
