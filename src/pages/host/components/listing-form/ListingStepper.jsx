import { Check, Lock } from 'lucide-react';

const STATE_LABELS = {
  active: 'Đang nhập',
  done: 'Đã xong',
  todo: 'Chưa nhập',
  locked: 'Mở sau khi lưu bước 1',
};

// steps: [{ id, label, state: 'active' | 'done' | 'todo' | 'locked' }]
export const ListingStepper = ({ steps, onSelect }) => {
  const current = steps.find((step) => step.state === 'active') ?? steps[0];

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-[#475569]">{`Bước ${current.id}/${steps.length} · ${current.label}`}</p>
      <nav aria-label="Các bước nhập thông tin cơ sở">
        <ol className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {steps.map((step) => {
            const isActive = step.state === 'active';
            const isLocked = step.state === 'locked';
            const isDone = step.state === 'done';
            return (
              <li key={step.id}>
                <button
                  type="button"
                  onClick={() => {
                    if (!isLocked) onSelect(step.id);
                  }}
                  aria-current={isActive ? 'step' : undefined}
                  aria-disabled={isLocked ? 'true' : undefined}
                  title={isLocked ? 'Lưu bước 1 để mở khóa bước này' : undefined}
                  className={`w-full h-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-colors ${
                    isActive
                      ? 'border-black border-2 bg-white'
                      : isLocked
                        ? 'border-[#E2E8F0] bg-[#F1F5F9] cursor-not-allowed'
                        : 'border-[#E2E8F0] bg-white hover:border-black/40 cursor-pointer'
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-semibold shrink-0 ${
                      isDone && !isActive
                        ? 'bg-[#15803D] text-white'
                        : isActive
                          ? 'bg-black text-white'
                          : isLocked
                            ? 'bg-[#CBD5E1] text-[#475569]'
                            : 'bg-[#F1F5F9] text-[#475569]'
                    }`}
                    aria-hidden="true"
                  >
                    {isDone && !isActive ? <Check size={13} /> : isLocked ? <Lock size={11} /> : step.id}
                  </span>
                  <span className="min-w-0">
                    <span className={`block text-sm truncate ${isActive ? 'font-semibold text-black' : 'text-black'}`}>
                      {step.label}
                    </span>
                    <span
                      className={`block text-[11px] truncate ${
                        isDone && !isActive ? 'text-[#15803D]' : 'text-[#64748B]'
                      }`}
                    >
                      {STATE_LABELS[step.state]}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
};
