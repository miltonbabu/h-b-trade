"use client";

import { useEffect, useState } from "react";

const HackerNotice = () => {
  const [lines, setLines] = useState<string[]>([]);
  const [showBox, setShowBox] = useState(false);

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
    }, 500);

    return () => {
      clearInterval(typeInterval);
      clearTimeout(showTimer);
    };
  }, []);

  if (!showBox) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] w-80 max-w-[calc(100vw-2rem)]">
      <div className="bg-black border-2 border-green-500 rounded-lg shadow-[0_0_20px_rgba(0,255,0,0.5)] overflow-hidden font-mono">
        {/* Terminal header bar */}
        <div className="flex items-center justify-between bg-green-900/40 border-b border-green-500 px-3 py-1.5">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
          </div>
          <span className="text-green-400 text-[10px] tracking-wider">root@cn-gov:~#</span>
        </div>

        {/* Terminal body */}
        <div className="p-3 h-64 overflow-y-auto">
          {lines.map((line, i) => (
            <div
              key={i}
              className={`text-xs leading-relaxed whitespace-pre-wrap break-words ${
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
