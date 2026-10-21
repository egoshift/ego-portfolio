import { useEffect, useState } from 'react';
import { loadContributions, type ContributionCalendar } from './contributions';

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

/** Month label above the first week that lands in a new month. */
function monthLabels(calendar: ContributionCalendar): (string | null)[] {
  let previous = -1;
  return calendar.weeks.map((week) => {
    const first = week[0];
    if (!first) return null;
    const month = Number(first.date.slice(5, 7)) - 1;
    if (month === previous) return null;
    previous = month;
    return MONTHS[month];
  });
}

export default function ContributionCalendarGrid() {
  const [calendar, setCalendar] = useState<ContributionCalendar | null>(null);

  useEffect(() => {
    let live = true;
    loadContributions().then((data) => {
      if (live) setCalendar(data);
    });
    return () => {
      live = false;
    };
  }, []);

  // The calendar is decoration — if the build step never ran, show nothing
  // rather than an error or a hole where the grid should be.
  if (!calendar) return null;

  const labels = monthLabels(calendar);

  return (
    <figure className="calendar">
      <div className="calendar__months" aria-hidden="true">
        {labels.map((label, i) => (
          <span key={i} className="calendar__month">
            {label}
          </span>
        ))}
      </div>
      <div className="calendar__grid">
        {calendar.weeks.map((week, w) => (
          <div key={w} className="calendar__week">
            {week.map((day) => (
              <span
                key={day.date}
                className="calendar__day"
                data-level={day.level}
                title={`${day.count} on ${day.date}`}
              />
            ))}
          </div>
        ))}
      </div>
    </figure>
  );
}
