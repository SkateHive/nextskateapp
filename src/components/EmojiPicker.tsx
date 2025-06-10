import EmojiPicker, { Theme } from "emoji-picker-react";
import React, { useEffect, useRef, useCallback, useMemo, memo } from "react";

interface EmojiPickerProps {
  isPickingEmoji: boolean;
  setIsPickingEmoji: (value: boolean) => void;
  setComment: (comment: string | ((prev: string) => string)) => void;
}

export const EmojiPickerComponent = memo(function EmojiPickerComponent({
  isPickingEmoji,
  setIsPickingEmoji,
  setComment,
}: EmojiPickerProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const handleOutsideClick = useCallback(
    (e: MouseEvent) => {
      if (parentRef.current && !parentRef.current.contains(e.target as Node)) {
        setIsPickingEmoji(false);
      }
    },
    [setIsPickingEmoji]
  );

  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [handleOutsideClick]);

  const handleEmojiClick = useCallback(
    (emoji: any) => {
      setComment((prev: string) => prev + emoji.emoji);
      setIsPickingEmoji(false);
    },
    [setComment, setIsPickingEmoji]
  );

  const containerStyle = useMemo(
    () => ({
      opacity: isPickingEmoji ? 1 : 0,
      pointerEvents: isPickingEmoji ? ("auto" as const) : ("none" as const),
      marginTop: 50,
      transition: "opacity 1s ease",
      zIndex: 10,
      position: "absolute" as const,
    }),
    [isPickingEmoji]
  );

  return (
    <div ref={parentRef} style={containerStyle}>
      <EmojiPicker theme={"dark" as Theme} onEmojiClick={handleEmojiClick} />
    </div>
  );
});
