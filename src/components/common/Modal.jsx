import { X } from 'lucide-react';

export const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className={`bg-white rounded-2xl shadow-2xl border border-[#CBD5E1] w-full ${maxWidth} overflow-hidden transform animate-in zoom-in-95 duration-200`}
      >
        {/* HEADER */}
        <div className="px-6 py-4 border-b border-[#CBD5E1] flex items-center justify-between">
          <h3 className="font-bold text-base text-black">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#64748B] hover:text-black hover:bg-[#F8F4E8] transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};
