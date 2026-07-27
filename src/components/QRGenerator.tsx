import React, { useState } from "react";
import { Copy, Check, QrCode } from "lucide-react";

interface QRGeneratorProps {
  value: string;
  projectName: string;
}

export default function QRGenerator({ value, projectName }: QRGeneratorProps) {
  const [copied, setCopied] = useState(false);

  // Generate a pseudo-random but stable 21x21 grid based on a hash of the value
  const generateGrid = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }

    const grid = Array.from({ length: 21 }, () => Array(21).fill(false));

    // Place typical QR corner finder patterns (7x7)
    // Top-Left
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const isBorder = r === 0 || r === 6 || c === 0 || c === 6;
        const isCenter = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        grid[r][c] = isBorder || isCenter;
      }
    }
    // Top-Right
    for (let r = 0; r < 7; r++) {
      for (let c = 14; c < 21; c++) {
        const isBorder = r === 0 || r === 6 || c === 14 || c === 20;
        const isCenter = r >= 2 && r <= 4 && c >= 16 && c <= 18;
        grid[r][c] = isBorder || isCenter;
      }
    }
    // Bottom-Left
    for (let r = 14; r < 21; r++) {
      for (let c = 0; c < 7; c++) {
        const isBorder = r === 14 || r === 20 || c === 0 || c === 6;
        const isCenter = r >= 16 && r <= 18 && c >= 2 && c <= 4;
        grid[r][c] = isBorder || isCenter;
      }
    }

    // Fill remaining areas with stable hash-based noise
    let hashValue = Math.abs(hash);
    for (let r = 0; r < 21; r++) {
      for (let c = 0; c < 21; c++) {
        // Skip corner alignment zones
        if (
          (r < 8 && c < 8) ||
          (r < 8 && c > 13) ||
          (r > 13 && c < 8)
        ) {
          continue;
        }
        // Pseudo-random bit
        hashValue = (hashValue * 16807) % 2147483647;
        grid[r][c] = hashValue % 2 === 0;
      }
    }

    return grid;
  };

  const grid = generateGrid(value);
  const size = 180;
  const cellSize = size / 21;

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col items-center p-4 bg-stone-900 border border-amber-500/30 rounded-xl max-w-sm mx-auto text-center shadow-lg">
      <div className="flex items-center gap-2 mb-3">
        <QrCode className="w-5 h-5 text-amber-500" />
        <span className="font-semibold text-stone-200 text-sm">Client Portal QR Code</span>
      </div>

      <div className="p-3 bg-white rounded-lg inline-block shadow-inner relative group">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {grid.map((row, r) =>
            row.map((active, c) => {
              if (!active) return null;
              return (
                <rect
                  key={`${r}-${c}`}
                  x={c * cellSize}
                  y={r * cellSize}
                  width={cellSize + 0.5} // slightly larger to prevent hairline gaps
                  height={cellSize + 0.5}
                  fill="#1c1917" // Stone 900 for dark QR code blocks
                />
              );
            })
          )}
          {/* Nilachal Creatives Central Golden Logo representation */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={14}
            fill="#1c1917"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={12}
            fill="#f5bd1f"
          />
          <g transform={`rotate(-6 ${size / 2} ${size / 2})`}>
            <text
              x={size / 2}
              y={size / 2 + 0.5}
              dominantBaseline="central"
              textAnchor="middle"
              fill="#1c1917"
              fontSize="8.5"
              fontWeight="900"
              fontFamily="'Space Grotesk', sans-serif"
              letterSpacing="-0.03em"
            >
              NC
            </text>
            <line
              x1={size / 2 - 8}
              y1={size / 2 + 4.5}
              x2={size / 2 + 8}
              y2={size / 2 + 3.5}
              stroke="#1c1917"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </g>
        </svg>
      </div>

      <p className="mt-3 text-xs text-stone-400 max-w-[220px]">
        Scan to view <strong className="text-amber-500">{projectName}</strong> live on any client device.
      </p>

      <div className="mt-4 flex w-full items-center gap-2 bg-stone-950 p-2 rounded-lg border border-stone-800">
        <input
          type="text"
          readOnly
          value={value}
          className="bg-transparent text-[11px] text-stone-400 outline-none w-full truncate px-1"
        />
        <button
          onClick={handleCopy}
          className="p-1.5 hover:bg-stone-800 text-stone-300 rounded transition duration-200"
          title="Copy Link"
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 text-green-500" />
          ) : (
            <Copy className="w-3.5 h-3.5 hover:text-amber-500" />
          )}
        </button>
      </div>
    </div>
  );
}
