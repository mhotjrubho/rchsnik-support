import React from 'react';
import { Coordinate } from '../types';

interface CursorProps {
  position: Coordinate;
  isClicking: boolean;
  label?: string;
  targetRect?: {
    x: number;
    y: number;
    width: number;
    height: number;
  } | null;
}

const Cursor: React.FC<CursorProps> = ({ position, isClicking, label, targetRect }) => {
  return (
    <>
      {/* Target element spotlight / focus halo */}
      {targetRect && (
        <div
          className="absolute pointer-events-none rounded transition-all duration-500 ease-out z-[90] ring-4 ring-[#337ab7]/50 bg-[#337ab7]/10"
          style={{
            left: `${targetRect.x - 4}px`,
            top: `${targetRect.y - 4}px`,
            width: `${targetRect.width + 8}px`,
            height: `${targetRect.height + 8}px`,
          }}
        >
          <span className="absolute -top-6 right-0 bg-[#337ab7] text-white text-[11px] font-bold px-2 py-0.5 rounded shadow whitespace-nowrap animate-pulse">
            מיקוד כאן
          </span>
        </div>
      )}

      {/* Main Animated Cursor */}
      <div
        className="absolute z-[120] pointer-events-none cursor-smooth flex flex-col items-start select-none"
        style={{
          top: `${position.y}px`,
          left: `${position.x}px`,
          transform: `translate(-2px, -2px) scale(${isClicking ? 0.85 : 1})`,
        }}
      >
        {/* Click ripple animation */}
        {isClicking && (
          <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-[#337ab7]/40 animate-ping pointer-events-none" />
        )}

        {/* Realistic Pointer SVG */}
        <div className="relative">
          <svg
            className="w-7 h-7 drop-shadow-[0_3px_8px_rgba(0,0,0,0.35)]"
            viewBox="0 0 24 24"
            fill="white"
            stroke="#1e293b"
            strokeWidth="1.5"
            strokeLinejoin="round"
          >
            <path d="M5.65,2.4C5.23,2.4,4.9,2.73,4.9,3.15v15.11c0,0.57,0.61,0.92,1.06,0.57l4.01-3.08l2.67,6.33c0.16,0.38,0.58,0.56,0.95,0.4l2.12-0.9c0.37-0.16,0.55-0.58,0.39-0.95l-2.67-6.33l4.6,0.2c0.55,0.02,0.85-0.63,0.48-1.04L6.15,2.54C6,2.45,5.83,2.4,5.65,2.4z" />
          </svg>
          {isClicking && (
            <span className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white animate-bounce" />
          )}
        </div>

        {/* Action badge under the cursor */}
        {label && (
          <div className="mt-1 bg-gray-900/90 text-white text-[11px] font-medium px-2 py-0.5 rounded shadow-lg backdrop-blur-sm border border-white/20 whitespace-nowrap transition-opacity">
            {label}
          </div>
        )}
      </div>
    </>
  );
};

export default Cursor;