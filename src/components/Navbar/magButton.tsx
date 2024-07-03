import { useHiveUser } from '@/contexts/UserContext';
import { IconButton } from '@chakra-ui/react';
import { FaPencil } from 'react-icons/fa6';
import { SlLogin } from 'react-icons/sl';

const MagButton = () => {
    const { hiveUser } = useHiveUser();
    return (
        <IconButton
            onClick={() => window.location.href = '/upload'}
            border="1px solid black"
            p={5}
            aria-label="camera"
            icon={hiveUser ? <FaPencil color="black" size={45} /> : <SlLogin color="black" size={45} />}
            size="lg"
            bg="limegreen"
            _hover={{ bg: 'limegreen', transform: 'scale(1.1)', transition: '0.3s' }}
            color="black"
            isRound
        />
    );
}

export default MagButton;