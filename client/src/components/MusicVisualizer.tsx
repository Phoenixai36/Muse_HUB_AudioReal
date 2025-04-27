import { useEffect, useRef } from "react";

export default function MusicVisualizer() {
  const numBars = 12; // Number of bars in the visualizer
  
  return (
    <div className="px-4 py-3 bg-black/30 flex justify-center items-end h-12">
      {Array.from({ length: numBars }).map((_, index) => {
        // Randomize the initial height of each bar
        const initialHeight = Math.floor(Math.random() * 9) + 2; // 2-10
        
        // Set up a different animation delay for each bar
        const delay = `${(index * 0.1) % 0.8}s`;
        
        return (
          <div
            key={index}
            className="visualizer-bar mx-0.5"
            style={{
              height: `${initialHeight}px`,
              width: '4px',
              backgroundColor: 'hsl(var(--primary))',
              display: 'inline-block',
              animationDelay: delay,
              animation: 'visualizer 1.2s infinite ease-in-out',
            }}
          />
        );
      })}
      
      <style jsx>{`
        @keyframes visualizer {
          0%, 100% { height: 4px; }
          50% { height: 16px; }
        }
      `}</style>
    </div>
  );
}
