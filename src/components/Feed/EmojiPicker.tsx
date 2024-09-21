import React, { useEffect, useRef, useState } from "react";
import { Button } from "@chakra-ui/react";
import { FaFaceSmile } from "react-icons/fa6";
import ReactImagePicker, { Theme } from "emoji-picker-react";

interface EmojiPickerProps {
  postBodyRef: React.RefObject<HTMLTextAreaElement>;
}

function EmojiPicker({ postBodyRef }: EmojiPickerProps) {
  const [isPickingEmoji, setIsPickingEmoji] = useState<boolean>(false);
  const parentRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleOutsideClick = (e: any) => {
    if (parentRef.current && !parentRef.current.contains(e.target)) {
      setIsPickingEmoji(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  useEffect(() => {
    if (isPickingEmoji && buttonRef.current && parentRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      parentRef.current.style.top = `${buttonRect.bottom + window.scrollY}px`;
      parentRef.current.style.left = `${buttonRect.left + window.scrollX}px`;
    }
  }, [isPickingEmoji]);

  const handleEmojiClick = (emoji: { emoji: string }) => {
    let positionStart = postBodyRef.current?.selectionStart ?? null;
    let positionEnd = postBodyRef.current?.selectionEnd ?? null;
    let currentText = postBodyRef.current?.value;
    let textBefore = currentText?.substring(0, positionStart as number);
    let textAfter = currentText?.substring(positionEnd as number);
    postBodyRef.current!.value = textBefore + emoji.emoji + textAfter;
  };

  return (
    <>
      <div
        ref={parentRef}
        style={{
          opacity: isPickingEmoji ? 1 : 0,
          transition: "1s",
          zIndex: 10,
          position: "absolute",
        }}
      >
        <ReactImagePicker
          theme={"dark" as Theme}
          onEmojiClick={handleEmojiClick}
          open={isPickingEmoji}
        />
      </div>
      <Button
        ref={buttonRef}
        name="md-select-emoji"
        variant="ghost"
        onClick={() => {
          setIsPickingEmoji((is) => !is);
        }}
        _hover={{
          background: "none",
        }}
      >
        <FaFaceSmile
          style={{
            color: "#ABE4B8",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.color = "limegreen";
            e.currentTarget.style.textShadow = "0 0 10px 0 limegreen";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.color = "#ABE4B8";
            e.currentTarget.style.textShadow = "none";
          }}
        />
      </Button>
    </>
  );
}

export default EmojiPicker;
