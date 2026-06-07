import { ListOrdered } from 'lucide-react';
import { stepTitleFromText } from '../utils/portfolioUrl';

interface LessonMiniTocProps {
  lessonNumber: number;
  steps: { text: string }[];
  onJumpToStep: (stepIndex: number) => void;
}

export function LessonMiniToc({ lessonNumber, steps, onJumpToStep }: LessonMiniTocProps) {
  if (steps.length === 0) return null;

  return (
    <nav
      className="rounded-2xl border border-pink-100/60 dark:border-pink-950/50 bg-pink-50/40 dark:bg-pink-950/15 p-4 space-y-3 print:break-inside-avoid"
      aria-label={`Mục lục bài ${lessonNumber}`}
    >
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span className="text-[10px] font-black text-pink-900 dark:text-pink-300 uppercase tracking-widest font-sans flex items-center gap-1.5">
          <ListOrdered className="w-3.5 h-3.5 text-pink-600 dark:text-pink-400" aria-hidden />
          Mini-ToC — Quy trình {steps.length} bước
        </span>
        <span className="text-[9px] font-bold text-pink-600/80 dark:text-pink-400 uppercase tracking-wide">
          Rubric §1 · Điều hướng
        </span>
      </div>
      <ol className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
        {steps.map((step, idx) => (
          <li key={idx}>
            <button
              type="button"
              onClick={() => onJumpToStep(idx)}
              className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-white/80 dark:hover:bg-slate-850 hover:text-pink-800 dark:hover:text-indigo-300 transition-colors cursor-pointer border border-transparent hover:border-pink-100/80 dark:hover:border-pink-900/50"
            >
              <span className="text-pink-600 dark:text-pink-400 font-black mr-1">{idx + 1}.</span>
              {stepTitleFromText(step.text)}
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
}
