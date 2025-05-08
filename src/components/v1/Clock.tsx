import React, { useState, useEffect } from 'react';

interface ClockProps {}

const Clock: React.FC<ClockProps> = () => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const formatDate = (date: Date): string => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: false,
    };

    return date.toLocaleTimeString('en-US', options).replace(/,/g, '');
  };

  return (
    <p className='text-xs font-semibold'>
      {formatDate(currentTime)}
    </p>
  );
};

export default Clock;