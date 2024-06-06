import { uploadFileToIPFS } from "@/app/upload/utils/uploadToIPFS";
import { updateProfile } from "@/lib/hive/client-functions";
import { HiveAccount } from "@/lib/models/user";
import { Button, Flex, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Tooltip } from "@chakra-ui/react";
import { ChangeEvent, useEffect, useState } from "react";
import { FaUpload } from 'react-icons/fa';

interface AvatarModalProps {
  isOpen: boolean
  onClose(): void
  user: HiveAccount 

}


const PINATA_GATEWAY_TOKEN = process.env.NEXT_PUBLIC_PINATA_GATEWAY_TOKEN;

export default function AvatarModal({ isOpen, onClose, user }: AvatarModalProps) {
  const [avatarUrl, setAvatarUrl] = useState<string>(user?.metadata?.profile_image || '');
  console.log(user?.metadata, "here");
  const [selectedProfileFile, setSelectedProfileFile] = useState<File | null>(null);

  async function sendEditTransaction() {
    if (user) {
      await updateProfile(user.name, "", "", "", avatarUrl, "", "", []);
    }
  }
  
  async function handleProfileFileInputChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedProfileFile(file);
      const data = await uploadFileToIPFS(file)
      const ipfsUrl = `https://ipfs.skatehive.app/ipfs/${data.IpfsHash}?pinataGatewayToken=${PINATA_GATEWAY_TOKEN}`;
      setAvatarUrl(ipfsUrl)
    }
  }

  useEffect(() => {
    setAvatarUrl(user?.metadata?.profile_image || '');
  }, [user]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent bg={"black"} border={"0.6px solid grey"}>
        <ModalHeader></ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          
         
          <Flex justifyContent="center">
          <Input
            placeholder="Avatar URL"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
          />
            <Tooltip label="Upload Image">
            <Button colorScheme="green" variant="outline" >
              <label htmlFor="avatarFileInput">
                <FaUpload />
              </label>
              <input
                type="file"
                id="avatarFileInput"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleProfileFileInputChange}
              />
            </Button>
            </Tooltip>
          </Flex>
          
          {selectedProfileFile && (
            <div>
              {selectedProfileFile.name}
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="green" variant="outline" onClick={sendEditTransaction}>
            Save
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
