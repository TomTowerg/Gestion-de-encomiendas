interface AttemptRecord {
  count: number;
  lockedUntil: number;
}

interface RegistrationRecord {
  count: number;
  resetAt: number;
}

const loginStore = new Map<string, AttemptRecord>();
const registrationStore = new Map<string, RegistrationRecord>();

export function checkLoginRateLimit(
  email: string
): { locked: boolean; minutesLeft?: number } {
  const now = Date.now();
  const record = loginStore.get(email);
  if (record && record.lockedUntil > now) {
    return {
      locked: true,
      minutesLeft: Math.ceil((record.lockedUntil - now) / 60_000),
    };
  }
  return { locked: false };
}

export function recordFailedLogin(
  email: string,
  maxAttempts = 5,
  lockoutMs = 15 * 60 * 1000
): void {
  const now = Date.now();
  const record = loginStore.get(email);
  const prevCount = record && record.lockedUntil <= now ? record.count : 0;
  const count = prevCount + 1;

  if (count >= maxAttempts) {
    loginStore.set(email, { count, lockedUntil: now + lockoutMs });
  } else {
    loginStore.set(email, { count, lockedUntil: 0 });
  }
}

export function clearLoginRateLimit(email: string): void {
  loginStore.delete(email);
}

export function checkRegistrationRateLimit(ip: string, max = 5): boolean {
  const now = Date.now();
  const record = registrationStore.get(ip);

  if (!record || record.resetAt <= now) {
    registrationStore.set(ip, { count: 1, resetAt: now + 3_600_000 });
    return true;
  }

  if (record.count >= max) return false;
  registrationStore.set(ip, { ...record, count: record.count + 1 });
  return true;
}
