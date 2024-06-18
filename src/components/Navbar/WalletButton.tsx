import { useHiveUser } from '@/contexts/UserContext';
import { IconButton } from '@chakra-ui/react';
import { FaGift } from 'react-icons/fa';
import { SlLogin } from 'react-icons/sl';

const WalletButton = () => {
    const { hiveUser } = useHiveUser();
    return (
        <IconButton
            onClick={() => window.location.href = '/upload'}
            border="1px solid black"
            p={5}
            aria-label="camera"
            icon={hiveUser ? <FaGift color="black" size={45} /> : <SlLogin color="black" size={45} />}
            size="lg"
            bg="yellow"
            _hover={{ bg: 'limegreen', transform: 'scale(1.1)', transition: '0.3s' }}
            color="black"
        />
    );
}

export default WalletButton;