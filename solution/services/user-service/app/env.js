import dotenv from 'dotenv';
import path from 'path'
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const env_path = path.resolve(__dirname, '.env');

dotenv.config({path: env_path});

export const DATABASE_URL = process.env.DATABASE_URL;
export const JWKS_URL = process.env.JWKS_URL;
export const JWT_AUDIENCE = process.env.JWT_AUDIENCE;
export const RABBITMQ_HOST = process.env.RABBITMQ_HOST;
export const RABBITMQ_HEARTBEAT_EXCHANGE = process.env.RABBITMQ_HEARTBEAT_EXCHANGE;

console.log("environment variables:");
console.log("DATABASE_URL:", DATABASE_URL);
console.log("JWKS_URL:", JWKS_URL);
console.log("JWT_AUDIENCE:", JWT_AUDIENCE);
console.log("RABBITMQ_HOST:", RABBITMQ_HOST);
console.log("RABBITMQ_HEARTBEAT_EXCHANGE:", RABBITMQ_HEARTBEAT_EXCHANGE);
console.log("----------------------");
