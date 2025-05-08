import { useEffect, useState } from "react";
import { MinusIcon, XMarkIcon } from "@heroicons/react/24/solid";

import SortIcon from '../../assets/sort.svg?react';

import { cx } from "../../utils/cx";
import { useWindowContext } from "../../contexts/Window.context";
import { WindowEnum } from "../../enums/Windows.enum";

export interface DraggableWindowProps {
  windowRef?: React.RefObject<HTMLDivElement | null>;
  boundaries?: {
    top: number,
    bottom: number;
  },
  children?: React.ReactNode;
  windowClassName?: string;
  window: WindowEnum;
  isOpen: boolean;
}

export default function DraggableWindow(props: DraggableWindowProps) {
  const windowContext = useWindowContext();
  const { children, window, windowClassName = '', windowRef, boundaries = { top: 0, bottom: 0 } } = props;
  const { focusedWindow, openedWindows, setFocusedWindow } = windowContext;
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setFocusedWindow(window);
    
    // Calculate the offset between mouse position and the rectangle's top-left corner
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
    
    // Prevent text selection during drag
    e.preventDefault();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    // Calculate new position
    let newY = e.clientY - dragOffset.y;
    
    // Apply vertical boundaries
    newY = Math.max(boundaries.top, Math.min(newY, boundaries.bottom));
    
    setPosition({
      x: e.clientX - dragOffset.x,
      y: newY
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      // Add document-level event listeners for mouse movements outside the component
      const handleDocumentMouseMove = (e: MouseEvent) => {
        if (!isDragging) return;
        
        let newY = e.clientY - dragOffset.y;
        newY = Math.max(boundaries.top, Math.min(newY, boundaries.bottom));
        
        setPosition({
          x: e.clientX - dragOffset.x,
          y: newY
        });
      };
      
      const handleDocumentMouseUp = () => {
        setIsDragging(false);
      };
      
      document.addEventListener('mousemove', handleDocumentMouseMove);
      document.addEventListener('mouseup', handleDocumentMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleDocumentMouseMove);
        document.removeEventListener('mouseup', handleDocumentMouseUp);
      };
    }
  }, [isDragging, dragOffset, boundaries]);

  return (
    <>
      <div 
        ref={windowRef}
        className={cx(
          "absolute backdrop-blur-[20px] bg-white/60 rounded-lg shadow-lg overflow-hidden",
          windowClassName,
          openedWindows.includes(window) ? '' : 'hidden',
          focusedWindow === window ? 'z-10' : 'z-2'
        )}
        style={{ 
          left: `${position.x}px`, 
          top: `${position.y}px`,
          transition: isDragging ? 'none' : 'box-shadow 0.2s ease'
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onClick={() => setFocusedWindow(window)}
      >
        {/* Window title bar */}
        <div 
          className="absolute top-0 h-[40px] w-full text-gray-800 px-4 py-2 flex items-center py-2 z-2"
          onMouseDown={handleMouseDown}
          style={{
            cursor: isDragging ? 'grabbing' : 'grab',
          }}
        >
          <div className="flex space-x-1">
            <button className="w-3 h-3 rounded-full border border-gray-300/50 bg-red-400">
              <XMarkIcon />
            </button>
            <button className="w-3 h-3 rounded-full border border-gray-300/50 bg-yellow-400">
              <MinusIcon />
            </button>
            <button className="w-3 h-3 rounded-full border border-gray-300/50 bg-green-400 flex items-center justify-center">
              <SortIcon className="size-[8px] -rotate-45" />
            </button>
          </div>
        </div>
        
        {/* Window content */}
        {children}
      </div>
    </>
  )
}