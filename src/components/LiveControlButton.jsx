import React from "react";
import { useLiveRunner } from "@/hooks/useLiveRunner";
import { clearToasts } from "@/components/ui/use-toast";
import { CheckCircle2, PauseCircle, Play } from "lucide-react";
import { formatLiveClock } from "@/lib/liveStorage";

export default function LiveControlButton({ onEvent }) {
  const { liveState, scenario, running, completed, progress, start, pause } =
    useLiveRunner({ onEvent });

  const current = liveState.currentSecond || 0;
  const label = completed
    ? "Live Completed"
    : running
      ? "Live Running"
      : liveState.status === "paused"
        ? "Resume Live"
        : "Start Live";

  const title = completed
    ? "Phiên Live đã hoàn tất và bị khóa để tránh tạo trùng dữ liệu."
    : running
      ? "Tạm dừng Live. Khi mở lại có thể chạy tiếp đúng giây hiện tại."
      : liveState.status === "paused"
        ? `Tiếp tục Live từ ${formatLiveClock(current)}`
        : scenario.description;

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        disabled={completed}
        onClick={() => {
          try {
            clearToasts();
          } catch {}
          if (running) pause();
          else start();
        }}
        className={`inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-sm font-semibold border transition-all ${
          completed
            ? "bg-primary/10 text-primary border-primary/20 cursor-not-allowed"
            : running
              ? "bg-amber-500/10 text-amber-300 border-amber-500/25 hover:bg-amber-500/20"
              : "bg-primary text-primary-foreground border-primary hover:bg-primary/90"
        }`}
        title={title}
      >
        {completed ? (
          <CheckCircle2 className="w-4 h-4" />
        ) : running ? (
          <PauseCircle className="w-4 h-4" />
        ) : (
          <Play className="w-4 h-4" />
        )}
        <span className="hidden sm:inline">{label}</span>
        <span className="ml-1 text-xs font-mono">
          {formatLiveClock(current)}/{formatLiveClock(scenario.totalDuration)}
        </span>
      </button>

      {(running || liveState.status === "paused") && !completed && (
        <div className="hidden md:block w-24 h-1.5 rounded-full bg-secondary overflow-hidden border border-border/60">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}
