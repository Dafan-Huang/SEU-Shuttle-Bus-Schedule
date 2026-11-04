import type { ReactNode } from 'react';
import { BusIcon } from './Icons';
import { TransitPalette } from './TransitPalette';

export function TransitHeader({ children }: { children?: ReactNode }) {
  return (
    <header className="transit-header">
      <div className="transit-header-content">
        <div className="transit-kicker">
          <BusIcon className="h-5 w-5" aria-hidden="true" />
          <span>东南大学 · 兰台公寓</span>
        </div>
        <h1>接驳车时刻查询</h1>
        <p>查看下一班车与完整时刻表</p>
        <TransitPalette />
      </div>
      <div className="transit-line" aria-hidden="true">
        <span /><span /><span />
      </div>
      {children}
    </header>
  );
}
