import { AlertCircle } from 'lucide-react';
import { errorId, fieldId } from './listingFormModel';

export const INPUT_CLASS =
  'w-full px-3.5 py-2.5 min-h-[44px] bg-white border rounded-lg text-base sm:text-sm text-black placeholder:text-[#94A3B8] focus:outline-none transition-colors disabled:bg-[#F1F5F9] disabled:text-[#64748B] disabled:cursor-not-allowed';
export const INPUT_OK_CLASS = 'border-[#CBD5E1] focus:border-black';
export const INPUT_ERROR_CLASS = 'border-[#DC2626] bg-[#FEF2F2]';

// Label + control + hint + error. The control itself sets id={fieldId(path)} and its aria attributes.
export const Field = ({ path, label, required = false, hint, error, counter, children, className = '' }) => (
  <div className={`space-y-1.5 ${className}`}>
    <div className="flex items-center justify-between gap-2">
      <label htmlFor={fieldId(path)} className="text-xs font-medium text-black">
        {label}
        {required && ' *'}
      </label>
      {counter && <span className="text-[11px] text-[#64748B]">{counter}</span>}
    </div>
    {children}
    {hint && !error && <p className="text-[11px] text-[#64748B]">{hint}</p>}
    {error && (
      <p id={errorId(path)} className="text-xs text-[#DC2626] flex items-center gap-1">
        <AlertCircle size={13} className="shrink-0" />
        <span>{error}</span>
      </p>
    )}
  </div>
);

export const ReadOnlyField = ({ label, value, className = '' }) => (
  <div className={`space-y-1 ${className}`}>
    <p className="text-xs font-medium text-black">{label}</p>
    <p className="text-sm text-black whitespace-pre-line break-words">{value || '—'}</p>
  </div>
);
