import { AlertCircle, CheckCircle2, X } from 'lucide-react';

export const Toast = ({ toast, onDismiss }) => {
  if (!toast) return null;
  const isError = toast.type === 'error';

  return (
    <div
      key={toast.id}
      role={isError ? 'alert' : 'status'}
      data-testid="host-toast"
      className={`fixed top-4 right-4 left-4 sm:left-auto sm:max-w-sm z-[60] flex items-start gap-3 px-4 py-3 rounded-xl shadow-xl border animate-in slide-in-from-top-4 duration-200 ${
        isError
          ? 'bg-[#FEF2F2] text-[#DC2626] border-[#DC2626]/30'
          : 'bg-[#DCFCE7] text-[#15803D] border-[#15803D]/20'
      }`}
    >
      {isError ? <AlertCircle size={20} className="shrink-0 mt-0.5" /> : <CheckCircle2 size={20} className="shrink-0 mt-0.5" />}
      <div className="flex-1 min-w-0 text-sm">
        {toast.title && <p className="font-semibold">{toast.title}</p>}
        <p className={toast.title ? 'text-xs mt-0.5 text-black/70' : 'font-semibold'}>{toast.message}</p>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Đóng thông báo"
        className="p-1 rounded-lg hover:bg-black/10 transition-colors cursor-pointer"
      >
        <X size={16} />
      </button>
    </div>
  );
};
