import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative grid h-9 w-9 place-items-center rounded-xl brand-gradient text-white shadow-sm">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 11l9-7 9 7" />
          <path d="M5 10v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-9" />
          <path d="M9 21v-6h6v6" />
        </svg>
      </div>
      <div className="leading-none">
        <div className="text-lg font-extrabold tracking-tight">
          Neighbor<span className="text-gradient">X</span>
        </div>
        <div className="text-[10px] font-medium text-muted-foreground -mt-0.5">
          Hyperlocal Community
        </div>
      </div>
    </div>
  );
}
