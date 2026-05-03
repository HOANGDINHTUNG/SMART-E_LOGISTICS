import { cn } from "@/lib/utils";

export default function StatCard({
  title,
  value,
  unit = null,
  icon: Icon,
  trend = undefined,
  color = "primary",
  subtitle = null,
}) {
  const colorMap = {
    primary:
      "text-primary bg-primary/10 border-primary/30 shadow-[0_0_15px_rgba(45,212,191,0.2)]",
    amber:
      "text-amber-400 bg-amber-400/10 border-amber-400/30 shadow-[0_0_15px_rgba(251,191,36,0.2)]",
    red: "text-red-400 bg-red-400/10 border-red-400/30 shadow-[0_0_15px_rgba(248,113,113,0.2)]",
    blue: "text-blue-400 bg-blue-400/10 border-blue-400/30 shadow-[0_0_15px_rgba(96,165,250,0.2)]",
  };

  const bgGradientMap = {
    primary: "from-primary/5 to-transparent",
    amber: "from-amber-400/5 to-transparent",
    red: "from-red-400/5 to-transparent",
    blue: "from-blue-400/5 to-transparent",
  };

  return (
    <div
      className={cn(
        "bg-card/40 backdrop-blur-xl border border-border/50 rounded-2xl p-5 flex flex-col gap-4 relative overflow-hidden transition-all duration-300 hover:border-border/80 hover:-translate-y-1 hover:shadow-xl group bg-gradient-to-br",
        bgGradientMap[color] || bgGradientMap.primary,
      )}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/5 to-transparent rounded-bl-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-white/5 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-center justify-between z-10 relative">
        <span className="text-sm font-medium text-muted-foreground">
          {title}
        </span>
        {Icon && (
          <div
            className={cn(
              "w-10 h-10 rounded-xl border flex items-center justify-center transition-transform group-hover:scale-110 duration-500",
              colorMap[color] || colorMap.primary,
            )}
          >
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      <div className="z-10 relative">
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-bold text-foreground font-mono drop-shadow-sm">
            {value}
          </span>
          {unit && (
            <span className="text-sm text-muted-foreground mb-1 font-medium">
              {unit}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-xs text-muted-foreground/80 mt-2 font-medium">
            {subtitle}
          </p>
        )}
        {trend !== undefined && (
          <p
            className={cn(
              "text-xs mt-1.5 font-medium flex items-center gap-1",
              trend >= 0 ? "text-primary" : "text-red-400",
            )}
          >
            <span className="text-[10px]">{trend >= 0 ? "▲" : "▼"}</span>{" "}
            {Math.abs(trend)}% so với hôm qua
          </p>
        )}
      </div>
    </div>
  );
}
