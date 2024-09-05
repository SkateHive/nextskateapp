import { LuArrowRightSquare } from "react-icons/lu";

interface CustomRightArrowProps {
    onClick: () => void;
}

const CustomRightArrow = ({ onClick }: CustomRightArrowProps) => {
    return (
        <div
            onClick={onClick}
            style={{
                position: 'absolute',
                right: '0',
                zIndex: '10',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '100%',
                cursor: 'pointer',
                opacity: 0,
                transition: 'opacity 0.3s ease',
                backdropFilter: 'blur(3px)',
                borderTopRightRadius: '10px',
                borderBottomRightRadius: '10px',
            }}
            className="custom-arrow"
        >
            <LuArrowRightSquare color="white" size="20px" />
        </div>
    );
};

export default CustomRightArrow;
