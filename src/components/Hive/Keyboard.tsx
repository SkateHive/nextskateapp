"use client";

import { useState } from "react";
import { Button, Flex } from "@chakra-ui/react";
import { FaArrowUpFromBracket, FaDeleteLeft } from "react-icons/fa6";
import { FaEraser } from "react-icons/fa";

interface KeyboardProps {
    onKeyPress: (key: string) => void;
    onBackspace: () => void;
    onClose: () => void;
    isActive: boolean;
}

const Keyboard = ({ onKeyPress, onBackspace, onClose, isActive }: KeyboardProps) => {
    const row1 = ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"];
    const row2 = ["a", "s", "d", "f", "g", "h", "j", "k", "l"];
    const row3 = ["z", "x", "c", "v", "b", "n", "m"];
    const numbersRow = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];
    const symbolsRow = ["-", "."];

    const [isShiftActive, setIsShiftActive] = useState(false);
    const toggleShift = () => setIsShiftActive(!isShiftActive);

    const buttonStyles = {
        m: "0rem",
        width: "0.8rem",
        h: "2rem", // reduced height
        colorScheme: "green",
        variant: "outline",
        fontSize: "1.25rem",
        p: "-0.1rem", // added padding to reduce internal space
    };

    return (
        <Flex
            direction="column"
            align="center"
            bottom={0}
            left={0}
            right={0}
            width="100%"
            bg="black"
            p={1}
            borderRadius="0"
        // removed mr={1} to avoid overflow
        >
            {isShiftActive ? (
                <Flex direction="row" width="100%" justify="center" flexWrap="wrap">
                    {numbersRow.map((key) => (
                        <Button key={key} {...buttonStyles} onClick={() => onKeyPress(key)}>
                            {key}
                        </Button>
                    ))}
                    {symbolsRow.map((key) => (
                        <Button key={key} {...buttonStyles} onClick={() => onKeyPress(key)}>
                            {key}
                        </Button>
                    ))}
                </Flex>
            ) : (
                <Flex direction="column" align="center" width="100%" flexWrap="nowrap" m={1}>
                    {[row1, row2, row3].map((row, rowIndex) => (
                        <Flex key={rowIndex} justify="center" mt="0.5rem">
                            {row.map((key) => (
                                <Button key={key} {...buttonStyles} onClick={() => onKeyPress(key)}>
                                    {key}
                                </Button>
                            ))}
                            {rowIndex === 2 && (
                                <Button {...buttonStyles} width="3.5rem" colorScheme="red" ml={1} onClick={onBackspace}>
                                    <FaDeleteLeft />
                                </Button>
                            )}
                        </Flex>
                    ))}
                </Flex>
            )}
            <Flex mt={3} justify="center">
                <Button {...buttonStyles} width="5rem" onClick={toggleShift}>
                    <FaArrowUpFromBracket />
                </Button>
                {/* Changed button: overriding colorscheme to red */}
                <Button {...buttonStyles} width="5rem" colorScheme="red" onClick={onClose}>
                    Close
                </Button>
            </Flex>
        </Flex>
    );
};

export default Keyboard;
