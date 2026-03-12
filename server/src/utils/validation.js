const STUDENT_STATUSES = new Set(['active', 'paused', 'inactive']);
const LESSON_FORMATS = new Set(['online', 'offline']);
const LESSON_STATUSES = new Set(['planned', 'completed', 'cancelled', 'no_show']);
const PAYMENT_METHODS = new Set(['cash', 'card', 'transfer']);
const LEAD_STATUSES = new Set(['new', 'contacted', 'converted', 'closed']);

function isValidDateString(value) {
  if (!value) {
    return false;
  }

  const parsed = new Date(value);
  return !Number.isNaN(parsed.getTime());
}

function normalizeString(value) {
  if (typeof value !== 'string') {
    return value ?? null;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function assertEnumValue(value, allowedValues, fieldName) {
  if (value == null || value === '') {
    return null;
  }

  if (!allowedValues.has(value)) {
    return `${fieldName} has invalid value`;
  }

  return null;
}

module.exports = {
  STUDENT_STATUSES,
  LESSON_FORMATS,
  LESSON_STATUSES,
  PAYMENT_METHODS,
  LEAD_STATUSES,
  isValidDateString,
  normalizeString,
  assertEnumValue,
};
