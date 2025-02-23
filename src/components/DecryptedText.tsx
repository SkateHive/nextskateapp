import React, { useEffect, useState } from "react";

const letters = `
FUCKア🛹🛹イウエオカキクᚠ ᚡ ᚢ ᚣ ᚤ ᚥ ᚦ ᚧ ᚨ ᚩ ᚪ ᚫ ᚬ ᚭ ᚮ ᚯ ᚰ
ᚱ ᚲ ᚳ ᚴ ᚵ ᚶ ᚷ ᚸ ᚹ ᚺ ᚻ ᚼ ᚽ ᚾ ᚿ ᛀ ᛁ ᛂ ᛃ ᛄ ᛅ ᛆ ᛇ ᛈ ᛉ ᛊ
ᛋ ᛌ ᛍ ᛎ ᛏ ᛐ ᛑ ᛒ ᛓ ᛔ ᛕ ᛖ ᛗ ᛘ ᛙ ᛚ ᛛ ᛜ ᛝ ᛞ ᛟ ᛠ ᛡ ᛢᛣ
ᛤ ᛥ ᛦ ᛧ ᛨ 🛹🛹ᛩ ᛪ ᛫ ᛬ ᛭ ᛮ ᛯ ᛰ 𐌜 𐌘 𐌞 𐌇ケコサシスセ🛹🛹ソ
タチツテトナニ🛹🛹FUCKヌネノ🛹🛹¯\_(ツ)_/¯ `;

const DecryptedText: React.FC<{ text: string }> = ({ text }) => {
    const [displayedText, setDisplayedText] = useState(text);

    useEffect(() => {
        let iteration = 0;
        const interval = setInterval(() => {
            setDisplayedText((prev) =>
                prev
                    .split("")
                    .map((char, index) => {
                        if (index < iteration) return text[index];
                        return letters[Math.floor(Math.random() * letters.length)];
                    })
                    .join("")
            );

            if (iteration >= text.length) clearInterval(interval);
            iteration += 1; // Increased increment for faster animation
        }, 10); // Reduced interval delay for faster animation

        return () => clearInterval(interval);
    }, [text]);

    return <span>{displayedText}</span>;
};

export default DecryptedText;
