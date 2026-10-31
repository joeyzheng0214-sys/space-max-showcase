import type { ScheduleItem } from "../../types";
const minutes = (s: string) => {
  const [h, m] = s.split(":").map(Number);
  return h * 60 + m;
};
// Visual roles only; source Task_Intensity and task priority remain untouched.
export function visualRole(title: string) {
  const name = title.trim().toLowerCase();
  if (name === "sleep" || name === "sleep preparation") return "background";
  if (name === "scientific experiment" || name === "research task") return "primary";
  return "secondary";
}
export function ScheduleEvent({ event, selectedHour, adjacentFill = false }: { event: ScheduleItem; selectedHour: number | null; adjacentFill?: boolean }) {
  const start = minutes(event.startTime), end = minutes(event.endTime), duration = end - start;
  const role = visualRole(event.title);
  const current = selectedHour !== null && selectedHour * 60 >= start && selectedHour * 60 < end;
  const showTime = duration >= 60 && !!event.proposed || (role !== "secondary" && duration >= 120);
  return (
    <article
      className={`schedule-event event-${role}${duration < 60 ? " event-duration-short" : ""} intensity-${event.taskIntensity} status-${event.status}${current ? " is-current" : ""}${event.proposed ? " is-modified" : ""}${adjacentFill ? " has-adjacent-fill" : ""}`}
      style={{ top: `${(start / 1440) * 100}%`, height: `${(duration / 1440) * 100}%` }}
      aria-current={current ? "time" : undefined}
      title={`${event.title} · ${event.startTime}–${event.endTime} · ${event.status}`}
      data-event-id={event.id}
      data-proposed={event.proposed || undefined}
      data-start-minutes={start}
      data-end-minutes={end}
      data-visual-role={role}
    >
      <i className="event-category-mark" aria-hidden="true" />
      {role === "secondary" ? (
        <div className="event-label">
          <strong>{event.title}</strong>
        </div>
      ) : (
        <div className={`event-range${duration < 60 ? " event-range-compact" : ""}${duration < 120 ? " event-range-short" : ""}`}>
          <strong>{event.title}</strong>
          {showTime && <span>{event.startTime}–{event.endTime}</span>}
        </div>
      )}
    </article>
  );
}
