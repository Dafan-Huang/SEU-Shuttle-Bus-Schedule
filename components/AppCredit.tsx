import React from 'react';
import { PwaControls } from './PwaControls';

const REPOSITORY_URL = 'https://github.com/Dafan-Huang/SEU-Shuttle-Bus-Schedule';

export const AppCredit: React.FC = () => (
  <>
    <PwaControls />
    <p className="mt-6 pb-2 text-center text-[11px] text-slate-400">
      此版本作者：發财
      <span className="mx-1.5" aria-hidden="true">·</span>
      <a
        href={REPOSITORY_URL}
        target="_blank"
        rel="noreferrer"
        className="underline underline-offset-2"
      >
        GitHub
      </a>
    </p>
  </>
);
