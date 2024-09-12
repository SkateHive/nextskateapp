import { useHiveUser } from '@/contexts/UserContext';
import { IconButton } from '@chakra-ui/react';
import { SlLogin } from 'react-icons/sl';
import { IoMdSwap } from "react-icons/io";

const SwapButton = () => {
    const { hiveUser } = useHiveUser();
    return (
        <IconButton
            onClick={() => window.location.href = '/wallet'}
            border="1px solid black"
            p={5}
            aria-label="swap"
            icon={hiveUser ? < IoMdSwap color="black" size={45} /> : <SlLogin color="black" size={45} />}
            size="lg"
            bg="yellow"
            _hover={{ bg: 'limegreen', transform: 'scale(1.1)', transition: '0.3s' }}
            color="black"
        />
    );
}

export default SwapButton;