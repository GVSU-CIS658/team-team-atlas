import { Request } from 'express';

export interface JwtPayload {
    id: string;
    email: string;
    username: string;
}

export interface AuthenticatedRequest extends Request {
    user?: JwtPayload;
}
