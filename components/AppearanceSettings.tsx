import { useEffect, useRef } from 'react';
import { TransitPalette } from './TransitPalette';

export function AppearanceSettings({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const closeButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeButton.current?.focus();
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previousFocus?.focus();
    };
  }, [isOpen, onClose]);

  return (
    <div hidden={!isOpen}>
      <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-end p-4">
        <section role="dialog" aria-modal="true" aria-labelledby="appearance-title"
          className="transit-panel w-full max-w-sm mt-16 mr-2 self-start max-h-[calc(100%-4rem)] overflow-y-auto p-4">
          <div className="flex justify-between items-center">
            <h2 id="appearance-title" className="text-lg font-bold text-slate-100">外观设置</h2>
            <button ref={closeButton} type="button" onClick={onClose} aria-label="关闭外观设置"
              className="text-slate-400 hover:text-white transition-colors">✕</button>
          </div>
          <TransitPalette />
          <button type="button" onClick={onClose} className="transit-schedule-toggle w-full mt-4 rounded-lg font-semibold px-4 py-2">
            完成
          </button>
        </section>
      </div>
    </div>
  );
}
