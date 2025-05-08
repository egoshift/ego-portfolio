import "../../styles/DockBar.styles.css";
import { useRef } from 'react';
import { motion } from 'framer-motion';
import { useWindowContext } from '../../contexts/Window.context';

import DotIcon from '../../assets/dot.svg?react';

import Works from '../../assets/works.svg?react';
import Interests from '../../assets/interests.svg?react';
import Certifications from '../../assets/certifications.svg?react';
import Souvenir from '../../assets/souvenir.svg?react';

import Finder from '../../assets/finder.svg?react';
import ThugGlasses from '../../assets/thug-glasses.svg?react';
import { WindowEnum } from '../../enums/Windows.enum';

const maxAdditionalSize = 5;

export default function DockBar() {
  const windowContext = useWindowContext();
  const { openedWindows, setOpenedWindows, setFocusedWindow } = windowContext;
  const dockRef = useRef<HTMLDivElement>(null);

  const scaleValue = (
    value: number,
    from: [number, number],
    to: [number, number]
  ) => {
    const scale = (to[1] - to[0]) / (from[1] - from[0]);
    const capped = Math.min(from[1], Math.max(from[0], value)) - from[0];
    return Math.floor(capped * scale + to[0]);
  }

  const handleOpenWindow = (window: WindowEnum) => {
    if (!openedWindows.includes(window)) {
      setOpenedWindows(prev => [...prev, window]);
    }

    setFocusedWindow(window);
  }

  const handleAppHover = (ev: React.MouseEvent<HTMLDivElement>) => {
    if (!dockRef.current) return;

    const mousePosition = ev.clientX;
    const iconPositionLeft = ev.currentTarget.getBoundingClientRect().left;
    const iconWidth = ev.currentTarget.getBoundingClientRect().width;

    const cursorDistance = (mousePosition - iconPositionLeft) / iconWidth;
    const offsetPixels = scaleValue(
      cursorDistance,
      [0, 1],
      [maxAdditionalSize * -1, maxAdditionalSize]
    );

    dockRef.current.style.setProperty(
      "--dock-offset-left",
      `${offsetPixels * -1}px`
    );

    dockRef.current.style.setProperty(
      "--dock-offset-right",
      `${offsetPixels}px`
    );
  };
  
  return (
    <div className="flex sticky bottom-5 items-center justify-center w-full">
      <div className="flex items-center justify-center w-auto h-auto p-2 rounded-xl border border-gray-400/30 backdrop-blur-[5px] bg-black/50 z-99 space-x-3">
        <div className="app w-auto h-auto flex flex-col items-center justify-center" onMouseMove={handleAppHover} onClick={() => handleOpenWindow(WindowEnum.EXPERIENCE)}>
          <div className="w-[60px] h-[60px] rounded-[13px] bg-gradient-to-b from-[#7162FF] to-[#200DCA] mb-3 flex items-center justify-center opacity-75">
            <Works />
          </div>
          <DotIcon className='opacity-70 size-[5px]' />
        </div>
        <div className="app w-auto h-auto flex flex-col items-center justify-center" onMouseMove={handleAppHover} onClick={() => handleOpenWindow(WindowEnum.INTERESTS)}>
          <div className="w-[60px] h-[60px] rounded-[13px] bg-gradient-to-b from-[#7BEC56] to-[#1C6204] mb-3 flex items-center justify-center opacity-75">
            <Interests />
          </div>
          <DotIcon className='opacity-70 size-[5px]' />
        </div>
        <div className="app w-auto h-auto flex flex-col items-center justify-center" onMouseMove={handleAppHover} onClick={() => handleOpenWindow(WindowEnum.CERTIFICATIONS)}>
          <div className="w-[60px] h-[60px] rounded-[13px] bg-gradient-to-b from-[#FF7676] to-[#800F0F] mb-3 flex items-center justify-center opacity-75">
            <Certifications />
          </div>
          <DotIcon className='opacity-70 size-[5px]' />
        </div>
        <div className="app w-auto h-auto flex flex-col items-center justify-center" onMouseMove={handleAppHover} onClick={() => {}}>
          <div
            className="w-[60px] h-[60px] rounded-[13px] mb-3 flex items-center justify-center opacity-75"
            style={{
              background: 'linear-gradient(to bottom, #1E9FC3 40%, #E9D949 100%)',
            }}
          >
            <Souvenir />
          </div>
          <DotIcon className='opacity-70 size-[5px]' />
        </div>
        <div className="app w-auto h-auto flex flex-col items-center justify-center" onMouseMove={handleAppHover} onClick={() => handleOpenWindow(WindowEnum.ABOUT)}>
          <div className="w-[60px] h-[60px] rounded-[13px] mb-3 flex items-center justify-center relative">
            <Finder />
            <motion.div
              className="absolute top-[17px]"
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <ThugGlasses />
            </motion.div>
          </div>
          <DotIcon className='opacity-70 size-[5px]' />
        </div>
      </div>
    </div>
  )
}