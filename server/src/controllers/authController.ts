import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest, JwtPayload } from '../types';

const COOKIE_NAME = 'campusfit_rt';
const ACCESS_TOKEN_EXPIRY = 900; // 15 minutes in seconds
const REFRESH_TOKEN_EXPIRY = '7d';

// Temporary in-memory store — replaced once DB is connected
interface StoredUser { id: string; username: string; email: string; password: string; createdAt: string; }
const inMemoryUsers = new Map<string, StoredUser>();

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
    const { username, email, password } = req.body;

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

    // TODO: replace with DB lookup
    if (inMemoryUsers.has(email.toLowerCase())) {
        res.status(409).json({ success: false, error: { code: 'CONFLICT', message: 'An account with this email already exists' } });
        return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // TODO: insert user into DB
    const user: StoredUser = {
        id: crypto.randomUUID(),
        username,
        email: email.toLowerCase(),
        password: hashedPassword,
        createdAt: new Date().toISOString(),
    };
    inMemoryUsers.set(user.email, user);

    res.status(201).json({
        success: true,
        data: { id: user.id, username: user.username, email: user.email, createdAt: user.createdAt },
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

    // TODO: replace with DB lookup
    const user = inMemoryUsers.get(email.toLowerCase());
    if (!user) {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid email or password' } });
        return;
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid email or password' } });
        return;
    }

    const tokenPayload: JwtPayload = { id: user.id, email: user.email, username: user.username };
    const accessToken = signAccessToken(tokenPayload);
    const refreshToken = signRefreshToken(tokenPayload);

    // TODO: store hashed refresh token in DB
    // await db.updateUserRefreshToken(user.id, await bcrypt.hash(refreshToken, 10));

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

    // TODO: fetch user from DB and validate stored refresh token hash
    // const user = await db.findUserById(payload.id);
    // if (!user?.refreshToken) { res.status(401).json(...); return; }
    // const valid = await bcrypt.compare(token, user.refreshToken);
    // if (!valid) { res.status(401).json(...); return; }

    const tokenPayload: JwtPayload = { id: payload.id, email: payload.email, username: payload.username };
    const newAccessToken = signAccessToken(tokenPayload);
    const newRefreshToken = signRefreshToken(tokenPayload);

    // TODO: update stored refresh token hash in DB
    // await db.updateUserRefreshToken(payload.id, await bcrypt.hash(newRefreshToken, 10));

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
        // TODO: clear refresh token from DB
        // try {
        //     const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as JwtPayload;
        //     await db.updateUserRefreshToken(payload.id, null);
        // } catch { /* token already invalid, no-op */ }
    }

    res.clearCookie(COOKIE_NAME, { path: '/api/v1/auth/refresh' });

    res.status(200).json({
        success: true,
        data: { message: 'Logged out' },
    });
};
