import { useUserData } from "@/contexts/UserContext";
import { IconButton } from "@chakra-ui/react";
import { FaGift } from "react-icons/fa";
import { SlLogin } from "react-icons/sl";
import { CSSProperties } from "react";

type WalletButtonProps = {
  styles: CSSProperties;
  onClick: () => void;
};

const WalletButton = ({ styles, onClick }: WalletButtonProps) => {
  const hiveUser = useUserData();
  return (
    <IconButton
      onClick={onClick}
      aria-label="wallet"
      icon={
        hiveUser ? (
          <FaGift color="black" size={35} />
        ) : (
          <SlLogin color="black" size={45} />
        )
      }
      style={styles}
    />
  );
};

export default WalletButton;