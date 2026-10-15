import React, { useState, useEffect } from 'react';
import { Flame } from 'lucide-react';

interface NeetTimerProps {
  theme?: 'dark' | 'light';
  variant?: 'banner' | 'inline';
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  targetYear: number;
}

export function getNextNeetDate(): { target: Date; targetYear: number } {
  const now = new Date();
  const currentYear = now.getFullYear();

  // NEET UG is traditionally held on the 1st Sunday of May at 14:00 (2:00 PM) IST (08:30 UTC)
  const getFirstSundayOfMay = (year: number) => {
    const d = new Date(Date.UTC(year, 4, 1, 8, 30, 0));
    const dayOfWeek = d.getUTCDay();
    const offset = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
    d.setUTCDate(1 + offset);
    return d;
  };

  let target = getFirstSundayOfMay(currentYear);
  let targetYear = currentYear;

  if (now.getTime() >= target.getTime()) {
    targetYear = currentYear + 1;
    target = getFirstSundayOfMay(targetYear);
  }

  return { target, targetYear };
}

function calculateTimeRemaining(): TimeRemaining {
  const { target, targetYear } = getNextNeetDate();
  const now = new Date();
  const diff = Math.max(0, target.getTime() - now.getTime());

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);

  return { days, hours, minutes, targetYear };
}

export const NeetTimer: React.FC<NeetTimerProps> = ({
  theme = 'dark',
  variant = 'banner',
}) => {
  const isDark = theme === 'dark';
  const [time, setTime] = useState<TimeRemaining>(calculateTimeRemaining);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setTime(calculateTimeRemaining());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const format2Digits = (num: number) => String(num).padStart(2, '0');

  if (variant === 'inline') {
    return (
      <div className="inline-flex items-center gap-1.5 font-mono font-bold">
        <span>{time.days} Days</span>
        <span className="opacity-60">:</span>
        <span>{format2Digits(time.hours)} Hours</span>
        <span className="opacity-60">:</span>
        <span>{format2Digits(time.minutes)} Minutes</span>
      </div>
    );
  }

  return (
    <div className="w-full px-4 pt-2 pb-1.5 flex justify-center select-none">
      <div
        role="region"
        aria-label="NEET UG Countdown Urgency Timer"
        className={`w-1/2 min-w-[150px] max-w-[210px] sm:w-full sm:min-w-0 sm:max-w-xl mx-auto rounded-2xl border backdrop-blur-md px-3 py-1.5 sm:px-4 text-xs transition-all shadow-xs ${
          isDark
            ? 'bg-red-950/25 border-red-500/30 text-white'
            : 'bg-red-100/50 border-red-300 text-red-950'
        }`}
      >
        {/* Mobile View: Width half, stacked - Countdown, [days] Days, below it [hours] Hour/Hours */}
        <div className="flex sm:hidden flex-col items-center justify-center text-center py-0.5">
          <span
            className={`text-[9px] font-mono font-bold uppercase tracking-widest leading-none ${
              isDark ? 'text-red-200/90' : 'text-red-800'
            }`}
          >
            Countdown
          </span>
          <span
            className={`text-sm font-black font-mono leading-tight mt-1 ${
              isDark ? 'text-amber-300' : 'text-red-700'
            }`}
          >
            {time.days} Days
          </span>
          <span
            className={`text-[11px] font-bold font-mono leading-tight ${
              isDark ? 'text-white' : 'text-slate-800'
            }`}
          >
            {time.hours} {time.hours === 1 ? 'Hour' : 'Hours'}
          </span>
        </div>

        {/* Desktop View: Horizontal row with Flame icon and Days : Hours : Minutes */}
        <div className="hidden sm:flex items-center justify-between gap-3">
          {/* Left: NEET UG Title with Flame icon */}
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isDark ? 'bg-red-400' : 'bg-red-500'
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  isDark ? 'bg-red-400' : 'bg-red-500'
                }`}
              />
            </span>

            <span
              className={`flex items-center gap-1.5 font-mono font-bold uppercase tracking-wider text-[11px] ${
                isDark ? 'text-red-200' : 'text-red-900'
              }`}
            >
              <Flame className="w-3.5 h-3.5 fill-current text-red-500" />
              <span>NEET UG {time.targetYear} Countdown</span>
            </span>
          </div>

          {/* Right: Days : Hours : Minutes Countdown Format */}
          <div className="flex items-center">
            <div
              className={`flex items-center gap-2 font-mono font-bold tracking-tight text-xs sm:text-sm px-2.5 py-0.5 rounded-xl border ${
                isDark
                  ? 'bg-black/30 border-white/10 text-white'
                  : 'bg-white/80 border-red-200 text-slate-900 shadow-xs'
              }`}
            >
              <div className="flex items-baseline gap-1">
                <span
                  className={`text-sm sm:text-base font-black ${
                    isDark ? 'text-amber-300' : 'text-red-700'
                  }`}
                >
                  {time.days}
                </span>
                <span className="text-[10px] uppercase font-sans font-bold tracking-wider opacity-80">
                  Days
                </span>
              </div>

              <span className="opacity-50">:</span>

              <div className="flex items-baseline gap-1">
                <span className="text-sm sm:text-base font-black">
                  {format2Digits(time.hours)}
                </span>
                <span className="text-[10px] uppercase font-sans font-bold tracking-wider opacity-80">
                  Hours
                </span>
              </div>

              <span className="opacity-50">:</span>

              <div className="flex items-baseline gap-1">
                <span className="text-sm sm:text-base font-black">
                  {format2Digits(time.minutes)}
                </span>
                <span className="text-[10px] uppercase font-sans font-bold tracking-wider opacity-80">
                  Minutes
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
