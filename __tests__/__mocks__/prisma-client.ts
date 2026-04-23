// Stub for @/app/generated/prisma/client — provides enum values so tests run
// without requiring the Prisma client to be generated (npx prisma generate).
// CI environments use this to avoid a full database setup during testing.
export const MentorLevel = {
  BASIC: "BASIC",
  ADVANCED: "ADVANCED",
  ELITE: "ELITE",
} as const;

export const RequestType = {
  SIGNUP: "SIGNUP",
  LEVEL_UPGRADE: "LEVEL_UPGRADE",
} as const;

export const SignupRequestStatus = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
} as const;

export const Confidence = {
  GOOD: "GOOD",
  OK: "OK",
  HARD: "HARD",
} as const;

export type Confidence = (typeof Confidence)[keyof typeof Confidence];
