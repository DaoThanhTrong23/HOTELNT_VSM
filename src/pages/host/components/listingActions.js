export const ACTION_ORDER = ['PREVIEW', 'EDIT', 'SUBMIT', 'WITHDRAW', 'DELETE'];

// Used only when the API omits allowedActions. Derived from the Excel notes:
// PUT edits DRAFT/REJECTED/HIDDEN/APPROVED and locks PENDING; submit-review from DRAFT/REJECTED/HIDDEN;
// DELETE for DRAFT/REJECTED; withdraw for PENDING; the owner can preview every status.
export const FALLBACK_ACTIONS = {
  DRAFT: ['PREVIEW', 'EDIT', 'SUBMIT', 'DELETE'],
  PENDING: ['PREVIEW', 'WITHDRAW'],
  APPROVED: ['PREVIEW', 'EDIT'],
  REJECTED: ['PREVIEW', 'EDIT', 'SUBMIT', 'DELETE'],
  HIDDEN: ['PREVIEW', 'EDIT', 'SUBMIT'],
};

export const resolveAllowedActions = (item) => {
  if (Array.isArray(item?.allowedActions)) {
    return ACTION_ORDER.filter((action) => item.allowedActions.includes(action));
  }
  return FALLBACK_ACTIONS[item?.trangThai] ?? ['PREVIEW'];
};
