import React, { useEffect, useState, useRef } from "react";

// Add TypeScript interface for Navigator with deviceMemory
interface NavigatorWithMemory extends Navigator {
    deviceMemory?: number;
}

const letters = `
FUCKアイウエオカキクᚠ ᚡ ᚢ ᚣ ᚤ ᚥ ᚦ ᚧ ᚨ ᚩ ᚪ ᚫ ᚬ ᚭ ᚮ ᚯ ᚰ
ᚱ ᚲ ᚳ ᚴ ᚵ ᚶ ᚷ ᚸ ᚹ ᚺ ᚻ ᚼ ᚽ ᚾ ᚿ ᛀ ᛁ ᛂ ᛃ ᛄ ᛅ ᛆ ᛇ ᛈ ᛉ ᛊ
ᛋ ᛌ ᛍ ᛎ ᛏ ᛐ ᛑ ᛒ ᛓ ᛔ ᛕ ᛖ ᛗ ᛘ ᛙ ᛚ ᛛ ᛜ ᛝ ᛞ ᛟ ᛠ ᛡ ᛢᛣ
ᛤ ᛥ ᛦ ᛧ ᛨ ᛩ ᛪ ᛫ ᛬ ᛭ ᛮ ᛯ ᛰ 𐌜 𐌘 𐌞 𐌇ケコサシスセソ
タチツテトナニFUCKヌネノ¯\_(ツ)_/¯ `;

interface DecryptedTextProps {
    text: string;
    performanceMode?: 'auto' | 'high' | 'low';
}

const DecryptedText: React.FC<DecryptedTextProps> = ({
    text,
    performanceMode = 'auto'
}) => {
    const [displayedText, setDisplayedText] = useState(text);
    const frameRef = useRef<number | null>(null);
    const iterationRef = useRef(0);
    const lastUpdateTimeRef = useRef(0);

    // Function to check if the device is Android
    const checkIfAndroid = () => {
        const isAndroid = /android/i.test(navigator.userAgent);
        sessionStorage.setItem('isAndroid', JSON.stringify(isAndroid));
        return isAndroid;
    };

    // Retrieve the OS information from sessionStorage or perform the check
    const isAndroid = typeof window !== 'undefined' && (
        sessionStorage.getItem('isAndroid') !== null
            ? JSON.parse(sessionStorage.getItem('isAndroid')!)
            : checkIfAndroid()
    );

    // Skip effect completely on Android unless high performance mode is explicitly set
    const skipEffect = isAndroid && performanceMode !== 'high';

    useEffect(() => {
        // If Android and not explicitly set to high performance, just show the text without effect
        if (skipEffect) {
            setDisplayedText(text);
            return;
        }

        // Reset iteration on text change
        iterationRef.current = 0;
        setDisplayedText(
            text.split("")
                .map(() => letters[Math.floor(Math.random() * letters.length)])
                .join("")
        );

        const animate = (timestamp: number) => {
            const throttleInterval = 16; // Standard for smooth 60fps

            if (timestamp - lastUpdateTimeRef.current >= throttleInterval) {
                lastUpdateTimeRef.current = timestamp;

                setDisplayedText(prev => {
                    return prev
                        .split("")
                        .map((char, index) => {
                            if (index < iterationRef.current) return text[index];
                            return letters[Math.floor(Math.random() * letters.length)];
                        })
                        .join("");
                });

                iterationRef.current += 1;
            }

            if (iterationRef.current < text.length) {
                frameRef.current = requestAnimationFrame(animate);
            }
        };

        // Start the animation
        frameRef.current = requestAnimationFrame(animate);

        return () => {
            if (frameRef.current !== null) {
                cancelAnimationFrame(frameRef.current);
            }
        };
    }, [text, skipEffect, performanceMode]);

    return <span>{displayedText}</span>;
};

export default DecryptedText;
