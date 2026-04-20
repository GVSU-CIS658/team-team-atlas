export interface IUser {
    id: string;
    username: string;
    email: string;
    password: string;
    refreshToken: string | null;
    createdAt: string;
}
