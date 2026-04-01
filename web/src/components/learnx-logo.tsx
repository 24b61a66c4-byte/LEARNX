import Image from "next/image";
import { forwardRef } from "react";

interface LearnxLogoProps {
  className?: string;
}

export const LearnxLogo = forwardRef<HTMLDivElement, LearnxLogoProps>(({ className }, ref) => {
  return (
    <div ref={ref} className={`inline-flex items-center gap-3 ${className || ''}`}>
      <Image
        alt="LearnX"
        className="h-12 w-12 rounded-xl shadow-lg"
        height={48}
        src="/logo.svg"
        width={48}
        unoptimized
      />
      <span className="flex flex-col leading-none">
        <span className="bg-gradient-to-r from-orange-500 to-teal-600 bg-clip-text text-xl font-bold tracking-tight text-transparent">
          LearnX
        </span>
        <span className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-teal-700">
          AI Study Hub
        </span>
      </span>
    </div>
  );
});

LearnxLogo.displayName = 'LearnxLogo';
