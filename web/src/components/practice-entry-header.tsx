"use client";

interface PracticeEntryHeaderProps {
  subjectName: string;
  topicTitle?: string;
}

export function PracticeEntryHeader({ subjectName, topicTitle }: PracticeEntryHeaderProps) {
  return (
    <div className="relative overflow-hidden rounded-[40px] bg-slate-950 p-10 text-white shadow-2xl mb-10">
      {/* Decorative background elements */}
      <div className="absolute right-0 top-0 h-64 w-64 translate-x-1/3 -translate-y-1/3 rounded-full bg-indigo-500/20 blur-[80px]" />
      <div className="absolute bottom-0 left-0 h-64 w-64 -translate-x-1/3 translate-y-1/3 rounded-full bg-teal-500/10 blur-[80px]" />
      
      <div className="relative">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-indigo-300 ring-1 ring-white/10">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-500"></span>
              </span>
              Mastery Lab Active
            </div>
            
            <h1 className="text-4xl font-black tracking-tight md:text-5xl lg:text-6xl italic">
              Hone Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-teal-300">Knowledge</span>
            </h1>
            
            <p className="max-w-xl text-lg font-medium text-slate-400 leading-relaxed">
              This is the fastest place to check whether the concept is actually sticking. You are currently focusing on
              <strong className="text-white"> {topicTitle || "General Concepts"}</strong> in 
              <strong className="text-white"> {subjectName}</strong>. 
              Close the loop with one scored pass and then repair anything that still feels weak.
            </p>
          </div>

          <div className="hidden shrink-0 space-y-3 md:block">
            <div className="flex items-center gap-4 rounded-3xl bg-white/5 p-4 ring-1 ring-white/10">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/20 text-indigo-400 shadow-inner">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">XP Scaling</p>
                <p className="text-lg font-bold text-white">Accuracy Based</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {[
            { label: "Format", value: "Mixed MCQ/Text", icon: "📝" },
            { label: "Target", value: "80% Accuracy", icon: "🎯" },
            { label: "Loop", value: "Tutor Review", icon: "🔄" }
          ].map((item) => (
            <div key={item.label} className="group relative flex items-center gap-3 rounded-2xl bg-white/5 p-4 transition-colors hover:bg-white/10 ring-1 ring-white/5">
              <span className="text-xl">{item.icon}</span>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">{item.label}</p>
                <p className="text-sm font-bold text-slate-200">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
