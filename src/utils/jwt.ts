import jwt from 'jsonwebtoken';
import { env } from '../config/env';

const JWT_SECRET = env.JWT_SECRET;

export function signJwt(payload: object) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyJwt(token: string) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch {
        return null;
    }
}
