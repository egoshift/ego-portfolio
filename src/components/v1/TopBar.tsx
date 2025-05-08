import Apple from '../../assets/apple.svg?react'
import { useWindowContext } from '../../contexts/Window.context'
import Clock from './Clock';

export default function TopBar() {
  const windowContext = useWindowContext();
  const { focusedWindow } = windowContext;
  
  return (
    <div className="h-[30px] w-full backdrop-filter backdrop-blur-[20px] bg-white/50 flex justify-between items-center px-2">
      <div className='flex items-center'>
        <Apple className='mb-1' />
        <p className='text-xs font-semibold mx-4'>{focusedWindow}</p>
      </div>
      <div className='flex items-center'>
        <Clock />
      </div>
    </div>
  )
}