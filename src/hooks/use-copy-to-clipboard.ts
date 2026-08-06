import { useState } from "react";

export function useCopyToClipboard() {
  const [timeoutId, setTimeoutId] = useState(-1);

  const copyToClipboard = async (content: string) => {
    await navigator.clipboard.writeText(content);
    window.clearTimeout(timeoutId);
    setTimeoutId(window.setTimeout(() => setTimeoutId(-1), 2000));
  };

  return {
    copyToClipboard,
    isCopied: timeoutId !== -1,
  };
}
