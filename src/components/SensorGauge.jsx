import { cn } from "@/lib/utils";
import { Thermometer, Droplets, Zap, Battery } from "lucide-react";

function GaugeBar({ value, min, max, warningMin, warningMax, color }) {
  const pct = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
  const isWarning = value < warningMin || value > warningMax;
  return (
    <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
      <div
        className={cn(
          "h-full rounded-full transition-all duration-500",
          isWarning ? "bg-red-400" : color,
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export default function SensorGauge({ data }) {
  const sensors = [
    {
      label: "Nhiệt độ",
      value: data?.temperature,
      unit: "°C",
      icon: Thermometer,
      min: -20,
      max: 60,
      warningMin: -5,
      warningMax: 35,
      color: "bg-primary",
    },
    {
      label: "Độ ẩm",
      value: data?.humidity,
      unit: "%",
      icon: Droplets,
      min: 0,
      max: 100,
      warningMin: 20,
      warningMax: 80,
      color: "bg-blue-400",
    },
    {
      label: "Va chạm",
      value: data?.shock_g,
      unit: "G",
      icon: Zap,
      min: 0,
      max: 10,
      warningMin: 0,
      warningMax: 3,
      color: "bg-amber-400",
    },
    {
      label: "Pin",
      value: data?.battery,
      unit: "%",
      icon: Battery,
      min: 0,
      max: 100,
      warningMin: 20,
      warningMax: 100,
      color: "bg-green-400",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {sensors.map(
        ({
          label,
          value,
          unit,
          icon: Icon,
          min,
          max,
          warningMin,
          warningMax,
          color,
        }) => {
          const val = value ?? "--";
          const isWarning =
            typeof value === "number" &&
            (value < warningMin || value > warningMax);
          return (
            <div
              key={label}
              className={cn(
                "bg-secondary/50 rounded-xl p-3 border",
                isWarning ? "border-red-400/40" : "border-border",
              )}
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon
                  className={cn(
                    "w-3.5 h-3.5",
                    isWarning ? "text-red-400" : "text-muted-foreground",
                  )}
                />
                <span className="text-xs text-muted-foreground">{label}</span>
              </div>
              <div
                className={cn(
                  "text-xl font-semibold font-mono mb-2",
                  isWarning ? "text-red-400" : "text-foreground",
                )}
              >
                {typeof val === "number" ? val.toFixed(1) : val}
                <span className="text-xs text-muted-foreground ml-1">
                  {unit}
                </span>
              </div>
              {typeof value === "number" && (
                <GaugeBar
                  value={value}
                  min={min}
                  max={max}
                  warningMin={warningMin}
                  warningMax={warningMax}
                  color={color}
                />
              )}
            </div>
          );
        },
      )}
    </div>
  );
}
