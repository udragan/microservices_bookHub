import dotenv from 'dotenv';
import path from 'path'
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const env_path = path.resolve(__dirname, '.env');

dotenv.config({path: env_path});

export const DB_USER = process.env.DB_USER;
export const DB_PASS = process.env.DB_PASS;
export const DB_NAME = process.env.DB_NAME;
export const DB_HOST = process.env.DB_HOST;
export const DB_PORT = process.env.DB_PORT;
export const JWKS_URL = process.env.JWKS_URL;
export const JWT_AUDIENCE = process.env.JWT_AUDIENCE;
