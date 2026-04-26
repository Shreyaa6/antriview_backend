import dotenv from 'dotenv';

dotenv.config();

export const config = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 4000),
  databaseUrl: process.env.DATABASE_URL ?? '',
  jwtSecret: process.env.JWT_SECRET ?? '',
  corsOrigin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map(o => o.trim()) : ['http://localhost:5173', 'https://ai-mock-roan-two.vercel.app'],
  googleClientId: process.env.GOOGLE_CLIENT_ID ?? '',
  groqApiKey: process.env.GROQ_API_KEY ?? '',
};

if (!config.databaseUrl) {
  console.error('CRITICAL WARNING: DATABASE_URL is not set in environment variables!');
}

if (!config.jwtSecret) {
  console.error('CRITICAL WARNING: JWT_SECRET is not set in environment variables!');
}
