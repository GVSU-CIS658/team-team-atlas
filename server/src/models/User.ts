export interface IUser {
    id: string;
    username: string;
    email: string;
    university: string | null;
    password: string;
    refreshToken: string | null;
    createdAt: string;
}
