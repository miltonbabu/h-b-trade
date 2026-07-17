"use client";

import { useEffect, useState, useRef } from "react";

const HackerNotice = () => {
  const [lines, setLines] = useState<string[]>([]);
  const [showBox, setShowBox] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const fullText = [
    "> Initializing secure connection...",
    "> Bypassing firewall... [OK]",
    "> Accessing server logs...",
    "> WARNING: Unauthorized access detected",
    "> ",
    "> This site is under Chinese government jurisdiction.",
    "> Your website hosting must be contacted to resolve this matter.",
    "> ",
    "> All traffic is being monitored and recorded.",
    "> Comply with regulations or face consequences.",
    "> ",
    "> Connection terminated.",
  ];

  useEffect(() => {
    let currentLines: string[] = [];
    let index = 0;

    const typeInterval = setInterval(() => {
      if (index < fullText.length) {
        currentLines = [...currentLines, fullText[index]];
        setLines([...currentLines]);
        index++;
      } else {
        clearInterval(typeInterval);
      }
    }, 400);

    const showTimer = setTimeout(() => {
      setShowBox(true);
    }, 2000);

    return () => {
      clearInterval(typeInterval);
      clearTimeout(showTimer);
    };
  }, []);

  // Block copy, cut, right-click, and screenshot attempts on the terminal
  useEffect(() => {
    if (!showBox) return;

    const el = containerRef.current;
    if (!el) return;

    const preventDefault = (e: Event) => {
      e.preventDefault();
      return false;
    };

    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      return false;
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Block Ctrl+C, Ctrl+X, Ctrl+A, Ctrl+S, Ctrl+P, PrintScreen, F12, Ctrl+Shift+I
      const key = e.key.toLowerCase();
      if (
        (e.ctrlKey && (key === "c" || key === "x" || key === "a" || key === "s" || key === "p")) ||
        e.key === "PrintScreen" ||
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && (key === "i" || key === "j" || key === "c"))
      ) {
        e.preventDefault();
        return false;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      // Clear clipboard if PrintScreen was pressed
      if (e.key === "PrintScreen") {
        if (navigator.clipboard) {
          navigator.clipboard.writeText("").catch(() => {});
        }
      }
    };

    el.addEventListener("selectstart", preventDefault);
    el.addEventListener("copy", handleCopy as EventListener);
    el.addEventListener("cut", handleCopy as EventListener);
    el.addEventListener("contextmenu", handleContextMenu);
    el.addEventListener("keydown", handleKeyDown);
    el.addEventListener("keyup", handleKeyUp);

    return () => {
      el.removeEventListener("selectstart", preventDefault);
      el.removeEventListener("copy", handleCopy as EventListener);
      el.removeEventListener("cut", handleCopy as EventListener);
      el.removeEventListener("contextmenu", handleContextMenu);
      el.removeEventListener("keydown", handleKeyDown);
      el.removeEventListener("keyup", handleKeyUp);
    };
  }, [showBox]);

  if (!showBox) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[150] flex items-center justify-center p-4"
      style={{
        userSelect: "none",
        WebkitUserSelect: "none",
        MozUserSelect: "none",
        msUserSelect: "none",
        WebkitTouchCallout: "none",
      }}
    >
      <div
        className="bg-black border-2 border-green-500 rounded-lg shadow-[0_0_30px_rgba(0,255,0,0.8)] overflow-hidden font-mono w-full max-w-md"
        style={{
          userSelect: "none",
          WebkitUserSelect: "none",
          MozUserSelect: "none",
          msUserSelect: "none",
        }}
      >
        {/* Terminal header bar */}
        <div className="flex items-center justify-between bg-green-900/60 border-b border-green-500 px-3 py-1.5">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
          </div>
          <span className="text-green-400 text-[10px] tracking-wider">root@cn-gov:~#</span>
          <span className="w-3.5"></span>
        </div>

        {/* Terminal body */}
        <div
          className="p-3 sm:p-4 max-h-[50vh] overflow-y-auto"
          style={{
            userSelect: "none",
            WebkitUserSelect: "none",
          }}
          onCopy={(e) => e.preventDefault()}
          onCut={(e) => e.preventDefault()}
          onContextMenu={(e) => e.preventDefault()}
        >
          {lines.map((line, i) => (
            <div
              key={i}
              className={`text-[10px] sm:text-xs leading-relaxed whitespace-pre-wrap break-words ${
                line.includes("WARNING") || line.includes("under Chinese government")
                  ? "text-red-500 font-bold"
                  : line.includes("terminated")
                  ? "text-red-600 font-bold animate-pulse"
                  : "text-green-400"
              }`}
            >
              {line}
              {i === lines.length - 1 && (
                <span className="inline-block w-2 h-3 bg-green-400 ml-0.5 animate-pulse"></span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HackerNotice;
