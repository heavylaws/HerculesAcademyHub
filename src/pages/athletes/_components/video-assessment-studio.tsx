import { useState, useRef, useEffect, useCallback } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  SkipBack,
  SkipForward,
  PenTool,
  Eraser,
  SplitSquareVertical,
  Download,
  Sparkles,
  Maximize2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Trash2,
  Video,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx";
import { toast } from "sonner";
import type { Doc } from "@/convex/_generated/dataModel.d.ts";

export type VideoAnalysisItem = Doc<"videoAnalyses"> & { videoUrl: string | null };

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  primaryAnalysis: VideoAnalysisItem;
  allAnalyses?: VideoAnalysisItem[];
  athleteName: string;
}

interface CoachCue {
  id: string;
  timeSeconds: number;
  text: string;
  category: "strength" | "improvement" | "note";
}

export default function VideoAssessmentStudio({
  open,
  onOpenChange,
  primaryAnalysis,
  allAnalyses = [],
  athleteName,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const compareVideoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Compare mode
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [compareAnalysisId, setCompareAnalysisId] = useState<string>(
    allAnalyses.find((a) => a._id !== primaryAnalysis._id)?._id ?? "",
  );

  // Drawing markup state
  const [activeTool, setActiveTool] = useState<"none" | "draw" | "line">("none");
  const [strokeColor, setStrokeColor] = useState("#fbbf24"); // neon yellow
  const [isDrawing, setIsDrawing] = useState(false);
  const [markupHistory, setMarkupHistory] = useState<ImageData[]>([]);

  // Coaching cues
  const [cues, setCues] = useState<CoachCue[]>([
    {
      id: "cue_1",
      timeSeconds: 0.8,
      text: "Drive phase shin angle measured at 43° — aggressive power transfer.",
      category: "strength",
    },
    {
      id: "cue_2",
      timeSeconds: 1.6,
      text: "Torso erects slightly too early before upright transition.",
      category: "improvement",
    },
  ]);
  const [newCueText, setNewCueText] = useState("");

  const compareAnalysis = allAnalyses.find((a) => a._id === compareAnalysisId);

  // Video time updates
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      if (compareVideoRef.current) compareVideoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      if (compareVideoRef.current) compareVideoRef.current.play();
      setIsPlaying(true);
    }
  };

  const setSpeed = (rate: number) => {
    setPlaybackRate(rate);
    if (videoRef.current) videoRef.current.playbackRate = rate;
    if (compareVideoRef.current) compareVideoRef.current.playbackRate = rate;
  };

  const stepFrame = (frames: number) => {
    if (!videoRef.current) return;
    videoRef.current.pause();
    setIsPlaying(false);
    // Approximate frame length at 25fps = 0.04s
    const target = Math.max(0, Math.min(duration, videoRef.current.currentTime + frames * 0.04));
    videoRef.current.currentTime = target;
  };

  // Canvas drawing handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTool === "none") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Pause video while drawing
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || activeTool === "none") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        setMarkupHistory((prev) => [...prev, ctx.getImageData(0, 0, canvas.width, canvas.height)]);
      }
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setMarkupHistory([]);
      toast.info("Canvas annotations cleared");
    }
  };

  const addCueAtCurrentTime = () => {
    if (!newCueText.trim()) return;
    const newCue: CoachCue = {
      id: `cue_${Date.now()}`,
      timeSeconds: Math.round(currentTime * 10) / 10,
      text: newCueText.trim(),
      category: "note",
    };
    setCues((prev) => [...prev, newCue]);
    setNewCueText("");
    toast.success(`Coaching cue added at ${formatSeconds(newCue.timeSeconds)}`);
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    const ms = Math.floor((sec % 1) * 10);
    return `${m}:${s < 10 ? "0" : ""}${s}.${ms}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl w-[95vw] h-[90vh] flex flex-col p-6 overflow-hidden bg-background/95 backdrop-blur-xl border-border">
        <DialogHeader className="flex flex-row items-center justify-between pb-3 border-b">
          <div>
            <DialogTitle className="text-xl font-display font-bold flex items-center gap-2">
              <Sparkles className="size-5 text-primary" />
              Biomechanics Video Studio: {athleteName}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Frame-by-frame analysis, kinematics markup, and dual-clip comparison.
            </DialogDescription>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={isCompareMode ? "default" : "outline"}
              size="sm"
              className="h-8 gap-1.5 text-xs font-semibold"
              onClick={() => setIsCompareMode((prev) => !prev)}
            >
              <SplitSquareVertical className="size-3.5" />
              {isCompareMode ? "Exit Split View" : "Split-Screen Compare"}
            </Button>
          </div>
        </DialogHeader>

        {/* Main Work Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0 overflow-y-auto py-2">
          {/* Left / Center Video Viewer & Canvas */}
          <div className={`flex flex-col gap-3 ${isCompareMode ? "lg:col-span-8" : "lg:col-span-8"}`}>
            <div className={`grid gap-3 relative ${isCompareMode ? "grid-cols-2" : "grid-cols-1"}`}>
              {/* Primary Video Container */}
              <div className="relative rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center border border-border shadow-2xl">
                {primaryAnalysis.videoUrl ? (
                  <video
                    ref={videoRef}
                    src={primaryAnalysis.videoUrl}
                    className="w-full h-full object-contain"
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    playsInline
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground text-sm">
                    <Video className="size-8 text-primary" />
                    <span>Video clip preview unavailable in local mock mode</span>
                    <span className="text-xs text-muted-foreground/70">
                      Using active simulation canvas for biomechanics overlay
                    </span>
                  </div>
                )}

                {/* Interactive Drawing Canvas Overlay */}
                <canvas
                  ref={canvasRef}
                  width={640}
                  height={360}
                  className={`absolute inset-0 w-full h-full ${
                    activeTool !== "none" ? "cursor-crosshair z-20 pointer-events-auto" : "pointer-events-none z-10"
                  }`}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                />

                <Badge className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-[10px] font-mono border-white/10 z-30">
                  Primary: {primaryAnalysis.filename}
                </Badge>
              </div>

              {/* Secondary Comparison Video Container */}
              {isCompareMode && (
                <div className="relative rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center border border-border shadow-2xl">
                  {compareAnalysis?.videoUrl ? (
                    <video
                      ref={compareVideoRef}
                      src={compareAnalysis.videoUrl}
                      className="w-full h-full object-contain"
                      playsInline
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground text-sm p-4 text-center">
                      <Layers className="size-8 text-indigo-400" />
                      <span className="text-xs">
                        {compareAnalysis?.filename ?? "Select reference clip"}
                      </span>
                    </div>
                  )}
                  <Badge className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-[10px] font-mono border-indigo-400/30 text-indigo-300 z-30">
                    Compare: {compareAnalysis?.filename ?? "Benchmark"}
                  </Badge>
                </div>
              )}
            </div>

            {/* Video Controls Bar */}
            <div className="rounded-xl border bg-card p-3 flex flex-col gap-2.5 shadow-sm">
              {/* Timeline scrubber */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-medium text-primary">
                  {formatSeconds(currentTime)}
                </span>
                <input
                  type="range"
                  min={0}
                  max={duration || 10}
                  step={0.01}
                  value={currentTime}
                  onChange={(e) => {
                    const t = Number(e.target.value);
                    setCurrentTime(t);
                    if (videoRef.current) videoRef.current.currentTime = t;
                  }}
                  className="flex-1 accent-primary h-1.5 bg-muted rounded-lg cursor-pointer"
                />
                <span className="text-xs font-mono text-muted-foreground">
                  {formatSeconds(duration || 10)}
                </span>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t">
                {/* Playback & Frame Stepping */}
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    className="size-8 p-0"
                    onClick={() => stepFrame(-1)}
                    title="Previous frame (-0.04s)"
                  >
                    <SkipBack className="size-3.5" />
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    className="h-8 px-3 gap-1.5 font-semibold text-xs"
                    onClick={togglePlay}
                  >
                    {isPlaying ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
                    {isPlaying ? "Pause" : "Play"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="size-8 p-0"
                    onClick={() => stepFrame(1)}
                    title="Next frame (+0.04s)"
                  >
                    <SkipForward className="size-3.5" />
                  </Button>

                  {/* Playback rate presets */}
                  <div className="flex items-center rounded-lg border bg-muted/30 p-0.5 ml-2">
                    {[0.25, 0.5, 1.0].map((rate) => (
                      <Button
                        key={rate}
                        variant={playbackRate === rate ? "secondary" : "ghost"}
                        size="sm"
                        className="h-6 px-1.5 text-[11px] font-mono"
                        onClick={() => setSpeed(rate)}
                      >
                        {rate}x
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Biomechanics Markup Tools */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-muted-foreground font-medium mr-1">Markup:</span>
                  <Button
                    variant={activeTool === "draw" ? "default" : "outline"}
                    size="sm"
                    className="h-7 px-2 gap-1 text-xs"
                    onClick={() => setActiveTool(activeTool === "draw" ? "none" : "draw")}
                  >
                    <PenTool className="size-3" />
                    Pen
                  </Button>

                  {/* Colors */}
                  {["#fbbf24", "#10b981", "#38bdf8", "#f43f5e"].map((color) => (
                    <button
                      key={color}
                      onClick={() => {
                        setStrokeColor(color);
                        if (activeTool === "none") setActiveTool("draw");
                      }}
                      className={`size-4 rounded-full border transition-all ${
                        strokeColor === color ? "scale-125 ring-2 ring-primary" : "opacity-70"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}

                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive"
                    onClick={clearCanvas}
                  >
                    <Eraser className="size-3 mr-1" />
                    Clear
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar: AI Biomechanics Analysis & Coaching Scorecard */}
          <div className="lg:col-span-4 flex flex-col gap-4 overflow-y-auto pr-1">
            {/* AI Breakdown Card */}
            {primaryAnalysis.feedback && (
              <Card className="bg-card/70 border-primary/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-1.5 font-semibold">
                    <Sparkles className="size-4 text-emerald-400" />
                    AI Biomechanics Diagnosis
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-3 text-xs">
                  <div className="rounded-lg bg-muted/40 p-2.5 leading-relaxed text-muted-foreground">
                    {primaryAnalysis.feedback.summary}
                  </div>

                  {primaryAnalysis.feedback.metrics.length > 0 && (
                    <div className="grid grid-cols-2 gap-2">
                      {primaryAnalysis.feedback.metrics.map((m, idx) => (
                        <div key={idx} className="rounded-lg border p-2 bg-background/50">
                          <div className="text-[10px] text-muted-foreground font-medium">{m.label}</div>
                          <div className="font-mono font-bold text-foreground mt-0.5">{m.value}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Coach Cues & Time-Stamped Annotations */}
            <Card className="flex-1 flex flex-col">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-1.5 font-semibold">
                    <Clock className="size-4 text-primary" />
                    Timestamped Coaching Cues
                  </CardTitle>
                  <Badge variant="secondary" className="text-[10px]">
                    {cues.length} Notes
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col gap-3">
                {/* Cue list */}
                <div className="flex-1 flex flex-col gap-2 overflow-y-auto max-h-56">
                  {cues.map((cue) => (
                    <div
                      key={cue.id}
                      className="flex items-start justify-between gap-2 p-2 rounded-lg border bg-muted/20 text-xs hover:bg-muted/40 cursor-pointer"
                      onClick={() => {
                        if (videoRef.current) {
                          videoRef.current.currentTime = cue.timeSeconds;
                          setCurrentTime(cue.timeSeconds);
                        }
                      }}
                    >
                      <div className="flex items-start gap-1.5 min-w-0">
                        <Badge variant="outline" className="font-mono text-[10px] px-1 py-0 shrink-0">
                          {formatSeconds(cue.timeSeconds)}
                        </Badge>
                        <p className="text-foreground leading-snug">{cue.text}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="size-5 p-0 text-muted-foreground hover:text-destructive shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCues((prev) => prev.filter((c) => c.id !== cue.id));
                        }}
                      >
                        <Trash2 className="size-3" />
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Add cue input */}
                <div className="flex items-center gap-1.5 pt-2 border-t">
                  <Input
                    placeholder={`Note at ${formatSeconds(currentTime)}...`}
                    value={newCueText}
                    onChange={(e) => setNewCueText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addCueAtCurrentTime()}
                    className="h-8 text-xs"
                  />
                  <Button
                    size="sm"
                    className="h-8 px-2.5 text-xs font-semibold shrink-0"
                    onClick={addCueAtCurrentTime}
                  >
                    <Plus className="size-3.5 mr-1" />
                    Log
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
