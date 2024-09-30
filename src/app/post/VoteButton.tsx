// VoteButton.tsx
"use client";

import { Button, Box, Slider, SliderTrack, SliderFilledTrack, SliderThumb, Text } from '@chakra-ui/react';
import { useState } from 'react';
import { handleVote } from '@/app/mainFeed/utils/handleFeedVote';

interface VoteButtonProps {
    author: string;
    permlink: string;
    username: string;
}

const VoteButton = ({ author, permlink, username }: VoteButtonProps) => {
    const [voteWeight, setVoteWeight] = useState(10000); // Default to 1000

    const handleVoteClick = async () => {
        console.log(author, permlink, username, voteWeight);
        await handleVote(author, permlink, username, voteWeight); // Pass the voteWeight
    };

    return (
        <Box width="100%">
            <Slider
                aria-label="vote weight"
                defaultValue={1000} // Set the default value for the slider
                min={0}
                max={10000}
                step={100}
                value={voteWeight}
                onChange={setVoteWeight}
            >
                <SliderTrack>
                    <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb />
            </Slider>
            <Text color="white" textAlign="center">
                Vote Weight: {voteWeight / 100}%
            </Text>
            <Button
                width="100%"
                bg="#201d21"
                color="white"
                onClick={handleVoteClick}
                mt={4} // Add margin-top for spacing
            >
                Vote
            </Button>
        </Box>
    );
};

export default VoteButton;
