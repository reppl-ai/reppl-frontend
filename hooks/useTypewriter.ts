import { useEffect, useState } from "react";

export function useTypewriter(text: string, key: string, speed = 20, enabled = true) {
  const [typed, setTyped] = useState(enabled ? "" : text);

  useEffect(() => {
    if (!enabled) {
      setTyped(text);
      return;
    }
    setTyped("");
    let index = 0;
    const timer = window.setInterval(() => {
      index += 1;
      setTyped(text.slice(0, index));
      if (index >= text.length) {
        window.clearInterval(timer);
      }
    }, speed);
    return () => window.clearInterval(timer);
  }, [enabled, key, speed, text]);

  return typed;
}
