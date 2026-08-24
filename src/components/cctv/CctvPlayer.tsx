"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Maximize2, Play, RefreshCw, VideoOff } from "lucide-react";

type PlayerState = "idle" | "connecting" | "playing" | "error";

type CctvPlayerProps = {
  assetId: number;
  label: string;
  /** Mulai memutar begitu komponen tampil, tanpa menunggu klik. */
  autoStart?: boolean;
};

/**
 * Pemutar live CCTV berbasis fragmented-MP4 dari /api/cctv/live/<id>/stream.
 *
 * Sengaja tidak memakai library: fMP4 diputar langsung oleh <video>, dan seluruh
 * medianya lewat HTTP biasa sehingga ikut proteksi session milik datek.
 */
export function CctvPlayer({ assetId, label, autoStart = false }: CctvPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<PlayerState>(autoStart ? "connecting" : "idle");
  // Dinaikkan untuk memaksa <video> membuka koneksi baru saat retry.
  const [attempt, setAttempt] = useState(0);

  const start = useCallback(() => {
    setState("connecting");
    setAttempt((n) => n + 1);
  }, []);

  const stop = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      video.pause();
      video.removeAttribute("src");
      video.load();
    }
    setState("idle");
  }, []);

  // Lepaskan koneksi ke server saat komponen dilepas, supaya go2rtc
  // tidak menahan stream RTSP yang sudah tidak ditonton siapa pun.
  useEffect(() => stop, [stop]);

  const toggleFullscreen = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void el.requestFullscreen();
    }
  }, []);

  const isLive = state === "connecting" || state === "playing";

  return (
    <div
      ref={containerRef}
      className="group relative aspect-video w-full overflow-hidden rounded-lg bg-slate-900"
    >
      {isLive && (
        <video
          key={attempt}
          ref={videoRef}
          src={`/api/cctv/live/${assetId}/stream?t=${attempt}`}
          autoPlay
          muted
          playsInline
          className="h-full w-full object-contain"
          onPlaying={() => setState("playing")}
          onError={() => setState("error")}
        />
      )}

      {state === "idle" && (
        <button
          type="button"
          onClick={start}
          className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-300 transition hover:bg-slate-800/50"
        >
          <Play className="h-10 w-10" />
          <span className="text-sm font-medium">Mulai Live</span>
        </button>
      )}

      {state === "connecting" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-300">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="text-sm">Menghubungkan ke kamera…</span>
        </div>
      )}

      {state === "error" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-4 text-center text-slate-300">
          <VideoOff className="h-8 w-8 text-red-400" />
          <span className="text-sm">Kamera tidak dapat dijangkau</span>
          <Button size="sm" variant="secondary" onClick={start}>
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
            Coba lagi
          </Button>
        </div>
      )}

      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between bg-gradient-to-b from-black/70 to-transparent p-2">
        <span className="truncate text-xs font-medium text-white drop-shadow">{label}</span>
        {state === "playing" && (
          <span className="flex shrink-0 items-center gap-1 rounded bg-red-600/90 px-1.5 py-0.5 text-[10px] font-bold text-white">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
            LIVE
          </span>
        )}
      </div>

      {isLive && (
        <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 transition group-hover:opacity-100">
          <Button size="icon" variant="secondary" className="h-7 w-7" onClick={toggleFullscreen}>
            <Maximize2 className="h-3.5 w-3.5" />
          </Button>
          <Button size="icon" variant="secondary" className="h-7 w-7" onClick={stop}>
            <VideoOff className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}
