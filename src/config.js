import dotenv from 'dotenv';

dotenv.config();

const normalize = (value) => {
  if (typeof value !== 'string') return '';
  const trimmed = value.trim();
  return trimmed.replace(/^"(.*)"$/, '$1').replace(/^\'(.*)\'$/, '$1');
};

const parseOrigins = (value) => {
  const raw = normalize(value);
  if (!raw) return ['http://localhost:5173', 'https://ai-mock-roan-two.vercel.app'];
  return raw.split(',').map((origin) => origin.trim()).filter(Boolean);
};

const databaseUrl = normalize(process.env.DATABASE_URL ?? '');
const jwtSecret = normalize(process.env.JWT_SECRET ?? '');
const googleClientId = normalize(process.env.GOOGLE_CLIENT_ID ?? '');
const groqApiKey = normalize(process.env.GROQ_API_KEY ?? '');

export const config = {
  nodeEnv: normalize(process.env.NODE_ENV ?? 'development'),
  port: Number(normalize(process.env.PORT ?? '4000')),
  databaseUrl,
  jwtSecret,
  corsOrigin: parseOrigins(process.env.CORS_ORIGIN ?? ''),
  googleClientId,
  groqApiKey,
};

if (!config.databaseUrl) {
  console.error('CRITICAL WARNING: DATABASE_URL is not set in environment variables!');
}

if (!config.jwtSecret) {
  console.error('CRITICAL WARNING: JWT_SECRET is not set in environment variables!');
}
