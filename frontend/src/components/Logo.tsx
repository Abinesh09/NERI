import { cn } from "@/lib/utils"

type LogoProps = {
  compact?: boolean
  className?: string
}

export default function Logo({ compact = false, className }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#C62828] via-[#F4B400] to-[#FFD54F] shadow-lg shadow-primary/20">
        <span className="text-lg font-bold text-white">நெ</span>
      </div>
      {!compact && (
        <div className="leading-none">
          <div className="bg-gradient-to-r from-[#F4B400] to-[#FFD54F] bg-clip-text text-lg font-bold text-transparent">
            நெறி
          </div>
          <div className="mt-1 text-xs font-bold tracking-[0.22em] text-foreground">NERI</div>
        </div>
      )}
    </div>
  )
}
