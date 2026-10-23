const { env } = require('../config/env');

function resetLink(token) {
  const url = new URL(env.PASSWORD_RESET_URL);
  url.searchParams.set('token', token);
  return url.toString();
}

async function sendPasswordResetEmail({ email, token }) {
  if (!env.RESEND_API_KEY || !env.RESET_EMAIL_FROM) {
    throw new Error('Password reset email is not configured.');
  }

  const response = await fetch('https://api.resend.com/emails', {
    body: JSON.stringify({
      from: env.RESET_EMAIL_FROM,
      html: `<p>Bonjour,</p><p>Pour choisir un nouveau mot de passe Maïa, ouvre ce lien : <a href="${resetLink(token)}">réinitialiser mon mot de passe</a>.</p><p>Il expire dans une heure. Si tu n'as pas demandé cette réinitialisation, tu peux ignorer cet e-mail.</p>`,
      subject: 'Réinitialise ton mot de passe Maïa',
      to: [email]
    }),
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    method: 'POST'
  });

  if (!response.ok) {
    throw new Error('Password reset email could not be sent.');
  }
}

module.exports = { sendPasswordResetEmail };
