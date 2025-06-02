"use client";

import { useUserData } from "@/contexts/UserContext";
import useAuthHiveUser from "@/lib/useHiveAuth";
import { Modal, ModalContent, ModalOverlay } from "@chakra-ui/react";
import { useState, memo, useCallback } from "react";
import ConnectedUserModal from "./connectedUserModal";
import DisconnectedUserModal from "./disconnectedModal";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginModal = memo(({ isOpen, onClose }: LoginModalProps) => {
  const [errorMessage, setErrorMessage] = useState("");
  const [isLogginIn, setIsLogginIn] = useState(false);
  const [username, setUsername] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const { loginWithHive } = useAuthHiveUser();
  const hiveUser = useUserData();

  const doLogin = useCallback(
    async (useLoginAs: boolean = false) => {
      try {
        setIsLogginIn(true);
        await loginWithHive(username, useLoginAs, privateKey);
        setIsLogginIn(false);
      } catch (error) {
        console.error(error);
        setErrorMessage(error ? error.toString() : "Unknown error");
        setIsLogginIn(false);
      }
    },
    [username, privateKey, loginWithHive]
  );

  const handleUsernameChange = useCallback((value: string) => {
    setUsername(value);
  }, []);

  const handlePrivateKeyChange = useCallback((value: string) => {
    setPrivateKey(value);
  }, []);

  const handleErrorMessageChange = useCallback((message: string) => {
    setErrorMessage(message);
  }, []);

  return (
    <Modal isOpen={isOpen} isCentered onClose={onClose}>
      <ModalOverlay />
      <ModalContent
        bg={"black"}
        mx={0}
        border={"1.2px solid #A5D6A7"}
        boxShadow={"0 0 20px #A5D6A7"}
        color={"#A5D6A7"}
        overflowX="hidden"
      >
        {hiveUser ? (
          <ConnectedUserModal onClose={onClose} />
        ) : (
          <DisconnectedUserModal
            username={username}
            setUsername={handleUsernameChange}
            errorMessage={errorMessage}
            isLogginIn={isLogginIn}
            onClose={onClose}
            doLogin={doLogin}
          />
        )}
      </ModalContent>
    </Modal>
  );
});

LoginModal.displayName = "LoginModal";

export default LoginModal;
