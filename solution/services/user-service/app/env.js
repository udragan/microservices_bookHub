import dotenv from 'dotenv';
import path from 'path'
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const env_path = path.resolve(__dirname, '.env');

dotenv.config({path: env_path});

export const JWKS_URL = process.env.JWKS_URL;
export const JWT_AUDIENCE = process.env.JWT_AUDIENCE;
