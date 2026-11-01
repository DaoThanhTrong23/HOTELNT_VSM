import { AlertCircle, AlertTriangle } from 'lucide-react';

const VARIANTS = {
  danger: { box: 'bg-[#FEF2F2] border-[#F4A9A9] text-[#DC2626]', icon: AlertCircle },
  warning: { box: 'bg-[#FEE8A8] border-[#FFC107] text-[#B45309]', icon: AlertTriangle },
};

// Pass role="alert" for errors caused by the user's last action; status banners stay silent.
export const FormBanner = ({ variant = 'danger', title, message, actionLabel, onAction, role }) => {
  const styles = VARIANTS[variant] ?? VARIANTS.danger;
  const Icon = styles.icon;
  return (
    <div role={role} className={`flex items-start gap-3 p-4 rounded-xl border ${styles.box}`}>
      <Icon size={20} className="shrink-0 mt-0.5" aria-hidden="true" />
      <div className="flex-1 min-w-0 text-sm">
        {title && <p className="font-semibold">{title}</p>}
        {message && <p className={title ? 'text-black/80 text-xs sm:text-sm mt-0.5' : ''}>{message}</p>}
        {actionLabel && (
          <button type="button" onClick={onAction} className="mt-1.5 text-xs font-semibold underline cursor-pointer">
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
};
