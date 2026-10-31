import type { ScheduleItem } from "../../types";
import { DaySelector } from "./DaySelector";
import { FatigueIndicator } from "./FatigueIndicator";
import type { FatigueReading } from "../../fatigue/model";
import { Timeline } from "./Timeline";
export function SchedulePanel({
  scheduleData,
  selectedDay,
  selectedHour,
  focusEventId,
  onDayChange,
  loading,
  fatigue,
  onHourChange,
}: {
  scheduleData: ScheduleItem[];
  selectedDay: number;
  selectedHour: number | null;
  focusEventId?: string;
  onDayChange: (day: number) => void;
  loading: boolean;
  fatigue: FatigueReading;
  onHourChange: (hour: number) => void;
}) {
  return (
    <aside
      className="schedule-panel panel dashboard-window"
      aria-label="Schedule"
      aria-busy={loading}
    >
      <header className="side-header">
        <div className="schedule-title">Schedule</div>
        <DaySelector selectedDay={selectedDay} onChange={onDayChange} />
        <FatigueIndicator value={fatigue.value} level={fatigue.level} />
      </header>
      <Timeline selectedDay={selectedDay} focusEventId={focusEventId} scheduleData={scheduleData} onHourChange={onHourChange} selectedHour={selectedHour} />
      <div className="edge-signal" aria-hidden="true" />
    </aside>
  );
}
