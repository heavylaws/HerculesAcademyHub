import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import {
  Calendar,
  ChevronDown,
  Clock,
  DoorOpen,
  Layers,
  Shield,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";

interface KioskHeaderProps {
  currentSessionId: string;
  sessions: Array<{
    _id: string;
    title: string;
    teamName: string;
    startsAt: string;
    checkedInCount?: number;
    rosterCount?: number;
  }>;
  onSelectSession: (sessionId: string) => void;
  audioEnabled: boolean;
  onToggleAudio: () => void;
}

export function KioskHeader({
  currentSessionId,
  sessions,
  onSelectSession,
  audioEnabled,
  onToggleAudio,
}: KioskHeaderProps) {
  const navigate = useNavigate();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const activeSession = sessions.find((s) => s._id === currentSessionId);

  return (
    <header className="flex h-20 shrink-0 items-center justify-between border-b border-border/80 bg-card/80 px-6 backdrop-blur-xl">
      {/* Brand & Station Info */}
      <div className="flex items-center gap-3.5">
        <div className="flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md shadow-primary/25 ring-2 ring-primary/20">
          <Shield className="size-6" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-display text-lg font-black tracking-tight text-foreground">
              PeakForm
            </span>
            <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-primary">
              Kiosk Station
            </span>
          </div>
          <p className="text-xs font-medium text-muted-foreground">
            Hercules Academy Attendance Terminal
          </p>
        </div>
      </div>

      {/* Center: Session Switcher (if multiple) */}
      <div className="flex items-center gap-3">
        {sessions.length > 1 ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="h-11 gap-2 rounded-xl px-4 font-semibold text-sm border-border hover:bg-muted"
              >
                <Layers className="size-4 text-primary" />
                <span className="max-w-[220px] truncate">
                  {activeSession ? activeSession.title : "Select Training Session"}
                </span>
                <ChevronDown className="size-3.5 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-80 p-1.5">
              {sessions.map((s) => (
                <DropdownMenuItem
                  key={s._id}
                  onClick={() => onSelectSession(s._id)}
                  className={`flex flex-col items-start gap-1 p-2.5 rounded-lg cursor-pointer ${
                    s._id === currentSessionId ? "bg-primary/10 font-semibold" : ""
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-bold text-foreground truncate">
                      {s.title}
                    </span>
                    <span className="text-[11px] font-mono text-muted-foreground">
                      {new Date(s.startsAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                    <span>{s.teamName}</span>
                    <span>•</span>
                    <span>
                      {s.checkedInCount ?? 0} / {s.rosterCount ?? 0} checked in
                    </span>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : activeSession ? (
          <div className="flex items-center gap-2 rounded-xl border bg-muted/30 px-3.5 py-1.5">
            <Layers className="size-4 text-primary" />
            <span className="text-xs font-semibold text-foreground">
              {activeSession.title} ({activeSession.teamName})
            </span>
          </div>
        ) : null}
      </div>

      {/* Right Controls: Audio Mute, Live Clock & Exit */}
      <div className="flex items-center gap-4">
        {/* Audio feedback toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleAudio}
          className="size-10 rounded-xl text-muted-foreground hover:text-foreground"
          title={audioEnabled ? "Audio chimes enabled" : "Audio chimes muted"}
        >
          {audioEnabled ? (
            <Volume2 className="size-5 text-primary" />
          ) : (
            <VolumeX className="size-5" />
          )}
        </Button>

        {/* Live Clock */}
        <div className="hidden sm:flex flex-col items-end text-right">
          <div className="flex items-center gap-1.5 font-mono text-lg font-bold tracking-tight text-foreground">
            <Clock className="size-4 text-primary" />
            <span>{format(time, "HH:mm:ss")}</span>
          </div>
          <span className="text-[11px] font-medium text-muted-foreground">
            {format(time, "EEEE, MMM d, yyyy")}
          </span>
        </div>

        {/* Exit Kiosk */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(currentSessionId ? `/sessions/${currentSessionId}` : "/schedule")}
          className="h-10 gap-2 rounded-xl px-3.5 text-xs font-semibold border-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
        >
          <DoorOpen className="size-4" />
          <span>Exit Kiosk</span>
        </Button>
      </div>
    </header>
  );
}
