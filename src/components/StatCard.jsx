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
    primary: "text-primary bg-primary/10 border-primary/20",
    amber: "text-amber-400 bg-amber-400/10 border-amber-400/20",
    red: "text-red-400 bg-red-400/10 border-red-400/20",
    blue: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  };

  return (
    <div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{title}</span>
        {Icon && (
          <div
            className={cn(
              "w-8 h-8 rounded-lg border flex items-center justify-center",
              colorMap[color],
            )}
          >
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>
      <div>
        <div className="flex items-end gap-1">
          <span className="text-3xl font-semibold text-foreground">
            {value}
          </span>
          {unit && (
            <span className="text-sm text-muted-foreground mb-1">{unit}</span>
          )}
        </div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
        {trend !== undefined && (
          <p
            className={cn(
              "text-xs mt-1",
              trend >= 0 ? "text-primary" : "text-red-400",
            )}
          >
            {trend >= 0 ? "▲" : "▼"} {Math.abs(trend)}% so với hôm qua
          </p>
        )}
      </div>
    </div>
  );
}
