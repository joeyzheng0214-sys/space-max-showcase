import { useLayoutEffect, useRef } from "react";
import type { ScheduleItem } from "../../types";
import { ScheduleEvent } from "./ScheduleEvent";
export function Timeline({
  scheduleData,
  onHourChange,
  selectedHour,
  selectedDay,
  focusEventId,
}: {
  scheduleData: ScheduleItem[];
  onHourChange: (hour: number) => void;
  selectedHour: number | null;
  selectedDay: number;
  focusEventId?: string;
}) {
  const viewport = useRef<HTMLDivElement>(null), canvas = useRef<HTMLDivElement>(null);
  const lastPlacement = useRef<{context: string; preview: string; anchor: number; height: number; viewportHeight: number} | null>(null);
  const minute = (time: string) => { const [h,m] = time.split(":").map(Number); return h*60+m; };
  const shortest = Math.min(60,...scheduleData.map(e=>Math.max(1,minute(e.endTime)-minute(e.startTime))));
  const minimumCanvasHeight = Math.ceil(1440 * 18 / shortest);
  const context = `${selectedDay}:${selectedHour}`;
  const current = selectedHour === null ? undefined : scheduleData.find(e=>minute(e.startTime)<=selectedHour*60&&minute(e.endTime)>selectedHour*60);
  const anchor = current ? minute(current.startTime) : selectedHour === null ? 600 : selectedHour*60;
  const focused = scheduleData.find(e=>e.proposed&&e.id===focusEventId) || scheduleData.find(e=>e.proposed);
  const preview = focused ? `${focused.id}:${focused.startTime}:${focused.endTime}` : "";
  const previewMinute = focused ? minute(focused.startTime) : anchor;
  useLayoutEffect(()=>{
    const view=viewport.current,track=canvas.current;if(!view||!track)return;
    const place=()=>{
      const height=track.getBoundingClientRect().height,previous=lastPlacement.current;
      const next={context,preview,anchor,height,viewportHeight:view.clientHeight};lastPlacement.current=next;
      const newPreview=!!preview&&preview!==previous?.preview;
      const contextChanged=!previous||context!==previous.context||anchor!==previous.anchor;
      const resized=!previous||Math.abs(height-previous.height)>0.5||view.clientHeight!==previous.viewportHeight;
      if(!newPreview&&!contextChanged&&!resized)return;
      const targetMinute=preview ? previewMinute : anchor;
      const origin=track.getBoundingClientRect().top-view.getBoundingClientRect().top+view.scrollTop-view.clientTop;
      const top=Math.max(0,Math.min(view.scrollHeight-view.clientHeight,origin+targetMinute*height/1440-view.clientHeight/3));
      const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      view.scrollTo({top,behavior:newPreview&&previous&&!reduceMotion?'smooth':'auto'});
    };
    place();
    const observer=new ResizeObserver(place);observer.observe(view);observer.observe(track);
    return()=>observer.disconnect();
  },[context,anchor,preview,previewMinute]);
  return (
    <div className="timeline" ref={viewport} role="region" aria-label="24-hour schedule timeline" tabIndex={0}>
      <div className="time-axis" ref={canvas} style={{minHeight: minimumCanvasHeight}}>
        <div className="timeline-track" aria-hidden="true" />
        {Array.from({ length: 25 }, (_, h) => (
          <div className="hour" key={h} style={{ top: `${(h / 24) * 100}%` }}>
            {h < 24 ? (
              <button
                className="hour-select"
                aria-pressed={selectedHour === h}
                aria-label={`Select hour ${String(h).padStart(2, "0")}:00`}
                onClick={() => onHourChange(h)}
              >
                <time>{String(h).padStart(2, "0")}:00</time>
              </button>
            ) : (
              <time>24:00</time>
            )}
            <i className="timeline-tick" aria-hidden="true" />
          </div>
        ))}
        {selectedHour !== null && (
          <div
            className="timeline-now"
            role="img"
            aria-label={`Selected time ${String(selectedHour).padStart(2, "0")}:00`}
            style={{ top: `${(selectedHour / 24) * 100}%` }}
          />
        )}
        {scheduleData.map((event) => (
          <ScheduleEvent key={event.id} event={event} selectedHour={selectedHour} adjacentFill={scheduleData.some(previous=>previous.id!==event.id&&previous.endTime===event.startTime)} />
        ))}
      </div>
    </div>
  );
}
