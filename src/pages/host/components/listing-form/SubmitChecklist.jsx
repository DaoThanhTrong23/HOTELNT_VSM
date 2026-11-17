import { CheckCircle2, Circle } from 'lucide-react';
import { CHECKLIST_ITEMS } from './listingFormModel';

// Right-hand panel "Điều kiện gửi kiểm duyệt" (Figma 12.x / 13.x). serverIssues = details[] of a 422.
export const SubmitChecklist = ({ checklist, missingKeys = [], serverIssues = [] }) => {
  const isDone = (key) => Boolean(checklist[key]) && !missingKeys.includes(key);
  const completed = CHECKLIST_ITEMS.filter((item) => isDone(item.key)).length;
  const total = CHECKLIST_ITEMS.length;
  const allDone = completed === total;

  return (
    <aside aria-labelledby="submit-checklist-title" className="bg-white rounded-2xl border border-[#CBD5E1] p-5 space-y-4">
      <div className="space-y-2">
        <h2 id="submit-checklist-title" className="text-base font-semibold text-black">
          Điều kiện gửi kiểm duyệt
        </h2>
        <p className={`text-xs ${allDone ? 'text-[#15803D]' : 'text-[#475569]'}`}>{`${completed}/${total} đã hoàn thành`}</p>
        <div
          role="progressbar"
          aria-label="Tiến độ điều kiện gửi kiểm duyệt"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={completed}
          className="h-1 rounded-full bg-[#E2E8F0] overflow-hidden"
        >
          <div
            className={`h-full transition-all ${allDone ? 'bg-[#15803D]' : 'bg-black'}`}
            style={{ width: `${(completed / total) * 100}%` }}
          />
        </div>
      </div>

      <ul className="space-y-3" data-testid="submit-checklist">
        {CHECKLIST_ITEMS.map((item) => {
          const done = isDone(item.key);
          return (
            <li key={item.key} data-checklist-key={item.key} data-done={done ? 'true' : 'false'} className="flex items-start gap-2.5">
              {done ? (
                <CheckCircle2 size={18} className="text-[#15803D] shrink-0 mt-0.5" aria-hidden="true" />
              ) : (
                <Circle size={18} className="text-[#94A3B8] shrink-0 mt-0.5" aria-hidden="true" />
              )}
              <div>
                <p className="text-sm text-black">{item.label}</p>
                <p className={`text-[11px] ${done ? 'text-[#15803D]' : 'text-[#64748B]'}`}>{done ? 'Đã xong' : 'Còn thiếu'}</p>
              </div>
            </li>
          );
        })}
      </ul>

      {serverIssues.length > 0 && (
        <div role="alert" className="rounded-lg bg-[#FEF2F2] border border-[#DC2626]/30 p-3 text-xs text-[#DC2626] space-y-1">
          <p className="font-medium">Máy chủ báo còn thiếu:</p>
          <ul className="list-disc pl-4 space-y-0.5">
            {serverIssues.map((issue, index) => (
              <li key={`${issue.field ?? 'issue'}-${index}`}>{issue.message ?? issue.field}</li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  );
};
