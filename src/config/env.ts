import dotenv from 'dotenv';
dotenv.config();

export const env = {
  PORT: process.env.PORT || 4000,
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET || 'dev_secret',
  SOCKET_IO_ORIGIN: process.env.SOCKET_IO_ORIGIN || '*',
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || ''
};
