import { useEffect, useState } from "react";
import type { Npc } from "./staging.ts";

const delivery: Partial<Record<Npc, { pitch: number; rate: number }>> = {
  cat: { pitch: 1.16, rate: 0.96 },
  guard: { pitch: 0.87, rate: 1 },
  driver: { pitch: 0.8, rate: 0.91 },
  clerk: { pitch: 1.08, rate: 1.04 },
  keeper: { pitch: 0.92, rate: 0.88 },
  child: { pitch: 1.29, rate: 1.03 },
};

export function useDialogueVoice() {
  const engine =
    typeof window !== "undefined" ? window.speechSynthesis : undefined;
  const [enabled, setEnabled] = useState(false);
  const [failed, setFailed] = useState(false);
  useEffect(
    () => () => {
      engine?.cancel();
    },
    [engine],
  );
  const stop = () => engine?.cancel();
  const speak = (text: string, npc?: Npc) => {
    if (!engine || !text) return;
    engine.cancel();
    const voices = engine.getVoices();
    const mandarin = voices.filter(({ lang }) =>
      /^(zh(-CN|-Hans)?|cmn)(-|$)/i.test(lang.replaceAll("_", "-")),
    );
    const voice =
      mandarin.find(({ localService }) => localService) ?? mandarin[0];
    if (voices.length && !voice) {
      setFailed(true);
      return;
    }
    const entry = new SpeechSynthesisUtterance(text);
    entry.lang = "zh-CN";
    if (voice) entry.voice = voice;
    const style = npc ? delivery[npc] : undefined;
    entry.pitch = style?.pitch ?? 1;
    entry.rate = style?.rate ?? 0.94;
    entry.onstart = () => setFailed(false);
    entry.onerror = ({ error }) => {
      if (error !== "canceled" && error !== "interrupted") setFailed(true);
    };
    engine.speak(entry);
  };
  return { supported: !!engine, enabled, failed, setEnabled, speak, stop };
}
