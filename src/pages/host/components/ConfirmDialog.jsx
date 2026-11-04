import { useEffect, useId, useRef, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, X } from 'lucide-react';

const MOBILE_QUERY = '(max-width: 767px)';
const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled])';

const subscribeToViewport = (onChange) => {
  if (typeof window.matchMedia !== 'function') return () => {};
  const query = window.matchMedia(MOBILE_QUERY);
  query.addEventListener?.('change', onChange);
  return () => query.removeEventListener?.('change', onChange);
};
const isMobileViewport = () => typeof window.matchMedia === 'function' && window.matchMedia(MOBILE_QUERY).matches;

const VARIANTS = {
  danger: {
    icon: 'bg-[#FEE2E2] text-[#DC2626]',
    confirm: 'bg-[#DC2626] text-white hover:bg-[#B91C1C]',
  },
  warning: {
    icon: 'bg-[#FEE8A8] text-[#D97706]',
    confirm: 'bg-black text-white hover:bg-neutral-800',
  },
};

// Responsive confirm dialog: centered modal on desktop, bottom sheet under 768px (Figma 11.3 / M11.3, 13.2 / M13.2).
export const ConfirmDialog = ({
  open,
  variant = 'danger',
  title,
  description,
  mobileDescription,
  confirmLabel,
  cancelLabel = 'Hủy',
  busy = false,
  busyLabel = 'Đang xử lý...',
  onConfirm,
  onCancel,
}) => {
  const isMobile = useSyncExternalStore(subscribeToViewport, isMobileViewport, () => false);
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef(null);
  const cancelRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const opener = document.activeElement;
    cancelRef.current?.focus();
    return () => {
      if (opener && typeof opener.focus === 'function' && document.contains(opener)) opener.focus();
    };
  }, [open]);

  if (!open) return null;

  const styles = VARIANTS[variant] ?? VARIANTS.danger;

  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      event.stopPropagation();
      if (!busy) onCancel();
      return;
    }
    if (event.key !== 'Tab' || !dialogRef.current) return;
    const focusable = Array.from(dialogRef.current.querySelectorAll(FOCUSABLE));
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return createPortal(
    <div
      className={`fixed inset-0 z-50 flex bg-black/50 ${isMobile ? 'items-end' : 'items-center justify-center p-4'}`}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) onCancel();
      }}
      onKeyDown={handleKeyDown}
    >
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        data-layout={isMobile ? 'sheet' : 'modal'}
        className={
          isMobile
            ? 'w-full bg-white rounded-t-2xl px-5 pt-5 pb-6 shadow-2xl animate-in slide-in-from-bottom duration-200'
            : 'w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200'
        }
      >
        <div className="flex items-start gap-3">
          <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${styles.icon}`}>
            <AlertTriangle size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <h2 id={titleId} className="text-base font-semibold text-black">
              {title}
            </h2>
            <p id={descriptionId} className="text-sm text-[#64748B] mt-1 leading-relaxed">
              {isMobile && mobileDescription ? mobileDescription : description}
            </p>
          </div>
          {!isMobile && (
            <button
              type="button"
              onClick={onCancel}
              disabled={busy}
              aria-label="Đóng"
              className="p-1 rounded-lg text-[#64748B] hover:text-black hover:bg-[#F8F4E8] transition-colors cursor-pointer disabled:opacity-40"
            >
              <X size={18} />
            </button>
          )}
        </div>

        <div className={`mt-5 gap-2 ${isMobile ? 'grid grid-cols-2' : 'flex justify-end'}`}>
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="min-h-[44px] px-4 rounded-lg border border-[#CBD5E1] bg-white text-sm font-medium text-black hover:bg-[#F8F4E8] transition-colors cursor-pointer disabled:opacity-40"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            aria-busy={busy ? 'true' : undefined}
            className={`min-h-[44px] px-4 rounded-lg text-sm font-medium transition-colors cursor-pointer disabled:opacity-60 ${styles.confirm}`}
          >
            {busy ? busyLabel : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};
