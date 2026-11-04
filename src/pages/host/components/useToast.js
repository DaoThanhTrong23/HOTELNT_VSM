import { useCallback, useEffect, useRef, useState } from 'react';

const TOAST_DURATION_MS = 4000;

// One toast at a time. The timer lives in an effect keyed on the toast,
// so it is cleared on unmount and restarted when a new toast replaces the old one.
export const useToast = (initialToast = null) => {
  const idRef = useRef(0);
  const [toast, setToast] = useState(() => (initialToast ? { ...initialToast, id: 0 } : null));

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), TOAST_DURATION_MS);
    return () => clearTimeout(timer);
  }, [toast]);

  const showToast = useCallback((next) => {
    idRef.current += 1;
    setToast({ type: 'success', ...next, id: idRef.current });
  }, []);

  const dismissToast = useCallback(() => setToast(null), []);

  return { toast, showToast, dismissToast };
};
