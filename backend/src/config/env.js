const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  HOST: process.env.HOST || '0.0.0.0',
  PORT: Number(process.env.PORT || 3000),
  DATABASE_URL: process.env.DATABASE_URL || '',
  JWT_SECRET: process.env.JWT_SECRET || 'change-me',
  // En production, définir explicitement l'URL publique du frontend, sans joker.
  CORS_ORIGIN: process.env.CORS_ORIGIN || '',
  PASSWORD_RESET_URL: process.env.PASSWORD_RESET_URL || 'maia://reset-password',
  RESEND_API_KEY: process.env.RESEND_API_KEY || '',
  RESET_EMAIL_FROM: process.env.RESET_EMAIL_FROM || ''
};

module.exports = { env };
