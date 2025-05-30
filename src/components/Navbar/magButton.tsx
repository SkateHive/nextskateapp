import { useUserData } from "@/contexts/UserContext";
import { IconButton } from "@chakra-ui/react";
import { FaPencil } from "react-icons/fa6";
import { SlLogin } from "react-icons/sl";
import { CSSProperties } from "react";

type MagButtonProps = {
  styles: CSSProperties;
  onClick: () => void;
};

const MagButton = ({ styles, onClick }: MagButtonProps) => {
  const hiveUser = useUserData();
  return (
    <IconButton
      onClick={onClick}
      aria-label="magazine"
      icon={
        hiveUser ? (
          <FaPencil color="black" size={35} />
        ) : (
          <SlLogin color="black" size={35} />
        )
      }
      style={styles}
    />
  );
};

export default MagButton;