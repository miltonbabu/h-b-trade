"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

const HackerNotice = () => {
  const [lines, setLines] = useState<string[]>([]);
  const [showBox, setShowBox] = useState(false);
  const [dismissed, setDismissed] = useState(false);

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
    if (dismissed) return;

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
  }, [dismissed]);

  if (!showBox || dismissed) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center pointer-events-none p-4">
      <div className="bg-black border-2 border-green-500 rounded-lg shadow-[0_0_30px_rgba(0,255,0,0.8)] overflow-hidden font-mono w-full max-w-md pointer-events-auto">
        {/* Terminal header bar */}
        <div className="flex items-center justify-between bg-green-900/60 border-b border-green-500 px-3 py-1.5">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
          </div>
          <span className="text-green-400 text-[10px] tracking-wider">root@cn-gov:~#</span>
          <button
            onClick={() => setDismissed(true)}
            className="text-green-400 hover:text-red-500 transition-colors"
            aria-label="Close terminal"
          >
            <X size={14} />
          </button>
        </div>

        {/* Terminal body */}
        <div className="p-3 sm:p-4 max-h-[50vh] overflow-y-auto">
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
