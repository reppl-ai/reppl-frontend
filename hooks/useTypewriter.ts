import { useEffect, useState } from "react";

export function useTypewriter(text: string, key: string, speed = 20, enabled = true, delay = 0) {
  const [typed, setTyped] = useState(enabled ? "" : text);

  useEffect(() => {
    if (!enabled) {
      setTyped(text);
      return;
    }

    setTyped("");
    let index = 0;
    let intervalId: number | null = null;
    const startTyping = () => {
      intervalId = window.setInterval(() => {
        index += 1;
        setTyped(text.slice(0, index));
        if (index >= text.length && intervalId !== null) {
          window.clearInterval(intervalId);
        }
      }, speed);
    };

    const timeoutId = window.setTimeout(startTyping, delay);

    return () => {
      window.clearTimeout(timeoutId);
      if (intervalId !== null) {
        window.clearInterval(intervalId);
      }
    };
  }, [delay, enabled, key, speed, text]);

  return typed;
}
