import { fatiguePresentation, type FatigueReading } from "../../fatigue/model";
export function FatigueIndicator({ value, level }: FatigueReading) {
  const display = fatiguePresentation(value, level);
  return (
    <section
      className={`fatigue-indicator fatigue-${display.kind}`}
      title="Synthetic Demo fatigue value; not a health reading. Unchanged by schedule previews."
      aria-label="Fatigue"
      aria-live="polite"
    >
      <div className="fatigue-heading">
        <span>FATIGUE</span>
        <span>{display.value === undefined ? "" : display.text}</span>
      </div>
      <div
        className="fatigue-track"
        role={display.value === undefined ? undefined : "progressbar"}
        aria-label={display.value === undefined ? undefined : "Fatigue"}
        aria-valuemin={display.value === undefined ? undefined : 0}
        aria-valuemax={display.value === undefined ? undefined : 100}
        aria-valuenow={display.value}
      >
        <div
          className="fatigue-fill"
          style={{
            width: display.value === undefined ? "0%" : `${display.value}%`,
          }}
        />
      </div>
      <div className="fatigue-level">{display.label}</div>
    </section>
  );
}
