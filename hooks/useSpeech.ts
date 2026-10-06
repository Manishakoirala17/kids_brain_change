"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export interface SayOptions {
  /** Cancel anything currently being said (default true). False queues after it. */
  interrupt?: boolean;
  /** Called once the voice actually starts (or immediately when muted/unsupported). */
  onStart?: () => void;
  /** Called if the browser refuses to speak, e.g. no user tap yet. */
  onBlocked?: () => void;
}

/** How long to wait for speech to start before assuming autoplay is blocked. */
const BLOCKED_TIMEOUT_MS = 1800;

function pickVoice(voices: SpeechSynthesisVoice[], preferredURI: string): SpeechSynthesisVoice | null {
  const preferred = voices.find((v) => v.voiceURI === preferredURI);
  if (preferred) return preferred;
  const english = voices.filter((v) => /^en/i.test(v.lang));
  return (
    english.find((v) => /en[-_]IN/i.test(v.lang)) ??
    english.find((v) => v.default) ??
    english[0] ??
    null
  );
}

/**
 * Wraps the Web Speech API. `talking` is true while the mascot should animate;
 * when muted it still "talks" briefly so the speech bubble feels alive.
 */
export function useSpeech({ muted, voiceURI }: { muted: boolean; voiceURI: string }) {
  const [supported, setSupported] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [talking, setTalking] = useState(false);
  const [bubble, setBubble] = useState("");
  const settings = useRef({ muted, voiceURI });
  settings.current = { muted, voiceURI };
  const talkTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!("speechSynthesis" in window) || typeof SpeechSynthesisUtterance === "undefined") return;
    setSupported(true);
    const load = () => setVoices(window.speechSynthesis.getVoices());
    load();
    window.speechSynthesis.addEventListener("voiceschanged", load);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", load);
      window.clearInterval(talkTimer.current);
    };
  }, []);

  // Some browsers skip `end` events, so poll `speaking` instead of trusting them.
  const startTalking = useCallback((fixedMs?: number) => {
    window.clearInterval(talkTimer.current);
    window.clearTimeout(talkTimer.current);
    setTalking(true);
    if (fixedMs) {
      talkTimer.current = window.setTimeout(() => setTalking(false), fixedMs);
      return;
    }
    talkTimer.current = window.setInterval(() => {
      const s = window.speechSynthesis;
      if (!s.speaking && !s.pending) {
        window.clearInterval(talkTimer.current);
        setTalking(false);
      }
    }, 250);
  }, []);

  const say = useCallback(
    (text: string, { interrupt = true, onStart, onBlocked }: SayOptions = {}) => {
      setBubble(text);
      const synth = typeof window !== "undefined" && "speechSynthesis" in window ? window.speechSynthesis : null;
      if (settings.current.muted || !synth) {
        startTalking(1400);
        onStart?.();
        return;
      }

      try {
        if (interrupt) synth.cancel();
        const u = new SpeechSynthesisUtterance(text);
        const voice = pickVoice(synth.getVoices(), settings.current.voiceURI);
        if (voice) {
          u.voice = voice;
          u.lang = voice.lang;
        } else {
          u.lang = "en-IN";
        }
        u.rate = 0.95;
        u.pitch = 1.25;

        let started = false;
        let blocked = false;
        const blockTimer = onBlocked
          ? window.setTimeout(() => {
              if (started) return;
              blocked = true;
              synth.cancel();
              onBlocked();
            }, BLOCKED_TIMEOUT_MS)
          : undefined;

        u.onstart = () => {
          started = true;
          window.clearTimeout(blockTimer);
          startTalking();
          onStart?.();
        };
        u.onerror = (e) => {
          window.clearTimeout(blockTimer);
          if (!started && !blocked && e.error === "not-allowed") {
            blocked = true;
            onBlocked?.();
          }
        };
        synth.speak(u);
        if (synth.paused) synth.resume(); // Chrome can get stuck paused
      } catch {
        startTalking(1400);
      }
    },
    [startTalking],
  );

  return useMemo(() => ({ say, talking, bubble, supported, voices }), [say, talking, bubble, supported, voices]);
}
