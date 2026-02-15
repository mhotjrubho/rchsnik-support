import React from 'react';
import { Coordinate } from '../types';

interface CursorProps {
  position: Coordinate;
  isClicking: boolean;
}

const Cursor: React.FC<CursorProps> = ({ position, isClicking }) => {
  return (
    <svg
      className={`absolute w-6 h-6 z-50 pointer-events-none cursor-transition drop-shadow-md`}
      style={{
        top: position.y,
        left: position.x,
        transform: `scale(${isClicking ? 0.7 : 1})`,
      }}
      viewBox="0 0 24 24"
      fill="white"
      stroke="black"
      strokeWidth="1.5"
    >
      <path d="M5.65,2.4C5.23,2.4,4.9,2.73,4.9,3.15v15.11c0,0.57,0.61,0.92,1.06,0.57l4.01-3.08l2.67,6.33c0.16,0.38,0.58,0.56,0.95,0.4l2.12-0.9c0.37-0.16,0.55-0.58,0.39-0.95l-2.67-6.33l4.6,0.2c0.55,0.02,0.85-0.63,0.48-1.04L6.15,2.54C6,2.45,5.83,2.4,5.65,2.4z" />
    </svg>
  );
};

export default Cursor;