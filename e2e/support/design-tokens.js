// Figma colors the test cases compare against. No Figma file is in the repo, so the values come from the two
// sources that agree on them: the token table in plans/2026-10-20-host-dashboard-profile/plan.md and the
// "UI / UX Pixel-Perfect" row of the test plan (#F8F4E8, #000000, #15803D, #DC2626, #B45309, #CBD5E1).
export const FIGMA_COLORS = {
  approved: '#15803D',
  pending: '#B45309',
  rejected: '#DC2626',
  muted: '#64748B',
  warning: '#B45309',
  danger: '#DC2626',
  success: '#15803D',
};

// The token table also lists Draft #475569, but the test plan does not, so Bản nháp and Ẩn are not checked.
export const DRAFT_TOKEN_NOT_IN_TEST_PLAN = '#475569';
