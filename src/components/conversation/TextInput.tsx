import { useEffect, useState } from "react";
export function TextInput({
  disabled,speechDraft,
  onSend,
  onInteract,
}: {
  disabled: boolean;
  speechDraft?: {messageId:string;text:string}|null;
  onInteract?: () => void;
  onSend: (text: string) => void;
}) {
  const [value, setValue] = useState("");
  useEffect(()=>{setValue(speechDraft?.text??'');},[speechDraft?.messageId]);
  const submit = () => {
    if (disabled || !value.trim()) return;
    onSend(value.trim());
    setValue("");
  };
  return (
    <form
      className="text-input"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <input
        aria-label="Message"
        maxLength={2000}
        placeholder="Try: I feel tired…"
        value={value}
        disabled={disabled && !onInteract}
        onPointerDown={onInteract}
        onFocus={onInteract}
        onChange={(e) => {onInteract?.();setValue(e.target.value);}}
        onKeyDown={(e) => {
          if (e.key === "Enter" && e.nativeEvent.isComposing)
            e.preventDefault();
        }}
      />
      <button
        type="submit"
        aria-label="Send message"
        disabled={disabled || !value.trim()}
      >
        <img src={`${import.meta.env.BASE_URL}assets/send.svg`} width="20" height="20" alt="" />
      </button>
    </form>
  );
}
