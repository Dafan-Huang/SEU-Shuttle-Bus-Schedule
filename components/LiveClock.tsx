import { useEffect, useState } from 'react';
import { ClockIcon } from './Icons';

const timeFormatter = new Intl.DateTimeFormat(undefined, {
  hour: '2-digit', minute: '2-digit', second: '2-digit'
});
const dateFormatter = new Intl.DateTimeFormat('zh-CN', {
  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
});

export function LiveClock({ mobile = false }: { mobile?: boolean }) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className={mobile ? 'flex items-center justify-center gap-3' : 'flex items-center gap-4'}>
      <ClockIcon className={mobile ? 'w-6 h-6 transit-clock' : 'w-8 h-8 transit-clock'} />
      <div className={mobile ? 'text-center' : undefined}>
        <p className={mobile ? 'text-2xl font-mono font-bold text-white' : 'text-3xl font-mono font-bold'}>
          {timeFormatter.format(now)}
        </p>
        <p className="text-sm text-slate-400">{dateFormatter.format(now)}</p>
      </div>
    </div>
  );
}
