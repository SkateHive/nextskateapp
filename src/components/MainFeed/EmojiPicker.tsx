import EmojiPicker, { Theme } from 'emoji-picker-react';
import React, { useEffect, useRef } from 'react';

export const EmojiPickerComponent = ({ isPickingEmoji, setIsPickingEmoji, setComment }: { isPickingEmoji: boolean, setIsPickingEmoji: (value: boolean) => void, setComment: (comment: string | ((prev: string) => string)) => void }) => {
    const parentRef = useRef<HTMLDivElement>(null);

    const handleOutsideClick = (e: MouseEvent) => {
        if (parentRef.current && !parentRef.current.contains(e.target as Node)) {
            setIsPickingEmoji(false);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleOutsideClick);
        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, []);

    return (
        <div
            ref={parentRef}
            style={{
                opacity: isPickingEmoji ? 1 : 0,
                pointerEvents: isPickingEmoji ? 'auto' : 'none',
                marginTop: 50,
                transition: 'opacity 1s ease',
                zIndex: 10,
                position: 'absolute',
            }}
        >
            <EmojiPicker
                theme={"dark" as Theme}
                onEmojiClick={(emoji) => {
                    setComment((prev: string) => prev + emoji.emoji);
                    setIsPickingEmoji(false);
                }}
            />
        </div>
    );
};
