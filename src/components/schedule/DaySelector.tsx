export function DaySelector({
  selectedDay,
  onChange,
}: {
  selectedDay: number;
  onChange: (day: number) => void;
}) {
  return (
    <nav className="day-selector" aria-label="Schedule day">
      <button
        type="button"
        className="day-arrow"
        aria-label="Previous Day"
        disabled={selectedDay <= 1}
        onClick={() => onChange(selectedDay - 1)}
      >
        <svg width="12" height="18" viewBox="0 0 12 18" fill="none" aria-hidden="true">
          <path d="M9 2 2 9l7 7" />
        </svg>
      </button>
      <span className="day-title" aria-live="polite" aria-atomic="true">Day {selectedDay}</span>
      <button
        type="button"
        className="day-arrow"
        aria-label="Next Day"
        disabled={selectedDay >= 7}
        onClick={() => onChange(selectedDay + 1)}
      >
        <svg width="12" height="18" viewBox="0 0 12 18" fill="none" aria-hidden="true">
          <path d="m3 2 7 7-7 7" />
        </svg>
      </button>
    </nav>
  );
}
