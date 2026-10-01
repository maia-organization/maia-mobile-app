const { ALLOWED_GOALS, ALLOWED_LEVELS, isNumberInRange, isValidIsoDate } = require('./validation');

function buildProfilePayload(body = {}) {
  return {
    birthdate: body.birthdate,
    cycleLength: Number(body.cycle_length),
    cycleStartDate: body.cycle_start_date,
    goal: typeof body.goal === 'string' ? body.goal.trim() : '',
    height: Number(body.height),
    level: typeof body.level === 'string' ? body.level.trim() : '',
    weight: Number(body.weight)
  };
}

function isValidProfile(payload) {
  return (
    isValidIsoDate(payload.birthdate) &&
    isNumberInRange(payload.weight, 30, 300) &&
    isNumberInRange(payload.height, 120, 230) &&
    ALLOWED_LEVELS.has(payload.level) &&
    ALLOWED_GOALS.has(payload.goal) &&
    isValidIsoDate(payload.cycleStartDate) &&
    Number.isInteger(payload.cycleLength) &&
    isNumberInRange(payload.cycleLength, 21, 40)
  );
}

module.exports = { buildProfilePayload, isValidProfile };
