import { LuArrowLeftSquare } from "react-icons/lu";

interface CustomLeftArrowProps {
    onClick: () => void;
}

const CustomLeftArrow = ({ onClick }: CustomLeftArrowProps) => {
    return (
        <div
            onClick={onClick}
            style={{
                position: 'absolute',
                left: '0px',
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
                borderTopLeftRadius: '10px',
                borderBottomLeftRadius: '10px',
            }}
            className="custom-arrow"
        >
            <LuArrowLeftSquare color="white" size="20px" />
        </div>
    );
};

export default CustomLeftArrow;
