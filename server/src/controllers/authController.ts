import { Request, Response } from 'express';

export const login = async (request: Request, response: Response) => {
    response.status(501).json({ message: 'Not implemented yet' });
};

export const register = async (request: Request, response: Response) => {
    response.status(501).json({ message: 'Not implemented yet' });
};