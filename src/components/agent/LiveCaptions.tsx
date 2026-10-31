export function LiveCaptions({text, visible, completed}: {text: string; visible: boolean; completed: boolean}) {
  return <div className={`live-captions${visible && text ? ' is-visible' : ''}${completed ? ' is-complete' : ''}`} aria-live="off" aria-hidden={!visible || !text}>
    <span>{text}</span>
  </div>;
}
