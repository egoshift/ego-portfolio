import React, { useState, useRef, useEffect } from 'react';
import { DraggableWindowProps } from './DraggableWindow';

interface DraggableAreaProps {
  children: React.ReactNode
}

const DraggableArea = (props: DraggableAreaProps) => {
  const { children } = props;
  const [boundaries, setBoundaries] = useState({ top: 0, bottom: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const windowRef = useRef<HTMLDivElement>(null);

  // Set up boundaries on component mount and window resize
  useEffect(() => {
    const updateBoundaries = () => {
      if (containerRef.current && windowRef.current) {
        setBoundaries({
          top: 0, // Minimum top position (10px from the top)
          bottom: containerRef.current.clientHeight - windowRef.current.clientHeight - 50 // Maximum bottom position
        });
      }
    };

    updateBoundaries();
    window.addEventListener('resize', updateBoundaries);
    
    return () => {
      window.removeEventListener('resize', updateBoundaries);
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full bg-transparent overflow-hidden"
    >
      {React.Children.map(children, (child) => 
        React.cloneElement(child as React.ReactElement<DraggableWindowProps>, { boundaries, windowRef })
      )}
    </div>
  );
};

export default DraggableArea;