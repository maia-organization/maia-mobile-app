const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { eq } = require('drizzle-orm');

const { db } = require('../db');
const { cycles, notificationSettings, users } = require('../db/schema');
const { errorResponse, successResponse } = require('../utils/response');
const { sendPasswordResetEmail } = require('../services/passwordResetEmail');
const {
  normalizeEmail,
  isStrongPassword,
  validateLoginCredentials,
  validateRegistration
} = require('../utils/validation');

const SALT_ROUNDS = 10;
const passwordHashFingerprint = (passwordHash) =>
  crypto.createHash('sha256').update(passwordHash).digest('hex');

const genericResetRequestResponse = () =>
  successResponse({
    message:
      'Si un compte correspond à cette adresse, un e-mail de réinitialisation vient d’être envoyé.'
  });

const defaultProfile = () => ({
  birthdate: '1995-01-01',
  weight: 60,
  height: 165,
  level: 'debutante',
  goal: 'regularite',
  cycleStartDate: new Date().toISOString().slice(0, 10),
  cycleLength: 28
});

const buildRegisterPayload = (body = {}) => {
  const defaults = defaultProfile();

  return {
    email: normalizeEmail(body.email),
    password: typeof body.password === 'string' ? body.password : '',
    name: typeof body.name === 'string' ? body.name.trim() : '',
    birthdate: body.birthdate === undefined ? defaults.birthdate : body.birthdate,
    weight: body.weight === undefined ? defaults.weight : Number(body.weight),
    height: body.height === undefined ? defaults.height : Number(body.height),
    level: typeof body.level === 'string' ? body.level.trim() : defaults.level,
    goal: typeof body.goal === 'string' ? body.goal.trim() : defaults.goal,
    cycleStartDate:
      body.cycle_start_date === undefined ? defaults.cycleStartDate : body.cycle_start_date,
    cycleLength: body.cycle_length === undefined ? defaults.cycleLength : Number(body.cycle_length)
  };
};

module.exports = async function authRoutes(app) {
  app.post('/register', async (request, reply) => {
    const payload = buildRegisterPayload(request.body);
    const validationError = validateRegistration(payload);

    if (validationError) {
      return reply.status(400).send(errorResponse('VALIDATION_ERROR', validationError));
    }

    const [existingUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, payload.email))
      .limit(1);

    if (existingUser) {
      return reply.status(400).send(errorResponse('EMAIL_ALREADY_USED', 'E-mail déjà utilisé.'));
    }

    const passwordHash = await bcrypt.hash(payload.password, SALT_ROUNDS);
    const createdUser = await db.transaction(async (transaction) => {
      const [user] = await transaction
        .insert(users)
        .values({
          email: payload.email,
          passwordHash,
          name: payload.name,
          birthdate: payload.birthdate,
          weight: payload.weight,
          height: payload.height,
          level: payload.level,
          goal: payload.goal,
          cycleStartDate: payload.cycleStartDate,
          cycleLength: payload.cycleLength
        })
        .returning({ id: users.id });

      await transaction.insert(cycles).values({
        userId: user.id,
        cycleStartDate: payload.cycleStartDate,
        cycleLength: payload.cycleLength
      });

      await transaction.insert(notificationSettings).values({
        userId: user.id
      });

      return user;
    });

    const token = app.jwt.sign({ sub: createdUser.id });

    return reply.status(201).send(successResponse({ token, user: { id: createdUser.id } }));
  });

  app.post('/login', async (request, reply) => {
    const email = normalizeEmail(request.body?.email);
    const password = request.body?.password || '';
    const credentialError = validateLoginCredentials({ email, password });

    if (credentialError) {
      return reply.status(400).send(errorResponse('VALIDATION_ERROR', credentialError));
    }

    const [user] = await db
      .select({ id: users.id, passwordHash: users.passwordHash })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      return reply
        .status(401)
        .send(errorResponse('INVALID_CREDENTIALS', 'Identifiants incorrects.'));
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatches) {
      return reply
        .status(401)
        .send(errorResponse('INVALID_CREDENTIALS', 'Identifiants incorrects.'));
    }

    const token = app.jwt.sign({ sub: user.id });

    return successResponse({ token, user: { id: user.id } });
  });

  app.post('/password-reset/request', async (request, reply) => {
    const email = normalizeEmail(request.body?.email);

    if (!email) {
      return reply
        .status(400)
        .send(errorResponse('VALIDATION_ERROR', 'Une adresse e-mail valide est requise.'));
    }

    const [user] = await db
      .select({ email: users.email, id: users.id, passwordHash: users.passwordHash })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) return genericResetRequestResponse();

    const token = app.jwt.sign(
      {
        passwordHashFingerprint: passwordHashFingerprint(user.passwordHash),
        purpose: 'password-reset',
        sub: user.id
      },
      { expiresIn: '1h' }
    );

    try {
      await sendPasswordResetEmail({ email: user.email, token });
    } catch (error) {
      request.log.error(error, 'Unable to send password reset email');
      return reply
        .status(503)
        .send(
          errorResponse(
            'EMAIL_UNAVAILABLE',
            "L'e-mail de réinitialisation ne peut pas être envoyé."
          )
        );
    }

    return genericResetRequestResponse();
  });

  app.post('/password-reset/confirm', async (request, reply) => {
    const token = typeof request.body?.token === 'string' ? request.body.token : '';
    const password = typeof request.body?.password === 'string' ? request.body.password : '';
    const passwordError = isStrongPassword(password)
      ? null
      : 'Le mot de passe doit contenir 8 caractères, une minuscule, une majuscule, un chiffre et un caractère spécial.';

    if (!token || passwordError) {
      return reply
        .status(400)
        .send(
          errorResponse(
            'VALIDATION_ERROR',
            passwordError || 'Le lien de réinitialisation est invalide.'
          )
        );
    }

    let payload;
    try {
      payload = app.jwt.verify(token);
    } catch {
      return reply
        .status(400)
        .send(
          errorResponse(
            'INVALID_RESET_TOKEN',
            'Ce lien de réinitialisation est invalide ou expiré.'
          )
        );
    }

    if (payload.purpose !== 'password-reset' || !payload.sub || !payload.passwordHashFingerprint) {
      return reply
        .status(400)
        .send(
          errorResponse(
            'INVALID_RESET_TOKEN',
            'Ce lien de réinitialisation est invalide ou expiré.'
          )
        );
    }

    const [user] = await db
      .select({ id: users.id, passwordHash: users.passwordHash })
      .from(users)
      .where(eq(users.id, payload.sub))
      .limit(1);

    if (!user || passwordHashFingerprint(user.passwordHash) !== payload.passwordHashFingerprint) {
      return reply
        .status(400)
        .send(
          errorResponse(
            'INVALID_RESET_TOKEN',
            'Ce lien de réinitialisation est invalide ou expiré.'
          )
        );
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    await db.update(users).set({ passwordHash }).where(eq(users.id, user.id));

    return successResponse({ message: 'Ton mot de passe a été réinitialisé.' });
  });
};
