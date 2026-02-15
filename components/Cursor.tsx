import React from 'react';
import { Coordinate } from '../types';

interface CursorProps {
  position: Coordinate;
  isClicking: boolean;
}

const Cursor: React.FC<CursorProps> = ({ position, isClicking }) => {
  return (
    <div
      className={`absolute w-5 h-5 z-50 pointer-events-none cursor-transition flex items-center justify-center`}
      style={{
        top: position.y,
        left: position.x,
        // Centering the cursor visual on the coordinate
        transform: `translate(-50%, -50%) scale(${isClicking ? 0.8 : 1})`,
      }}
    >
      {/* Cursor Body */}
      <div className="relative w-full h-full">
        <div className="absolute w-4 h-4 bg-slate-800 rounded-full border-2 border-white shadow-lg opacity-90"></div>
        {/* Simple arrow tip representation if needed, but the dot is cleaner for simulation */}
      </div>
    </div>
  );
};

export default Cursor;