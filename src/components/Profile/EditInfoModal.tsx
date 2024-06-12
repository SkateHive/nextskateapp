'use client'

import { uploadFileToIPFS } from "@/app/upload/utils/uploadToIPFS";
import { updateProfile } from "@/lib/hive/client-functions";
import { HiveAccount, VideoPart } from "@/lib/models/user";
import {
  Badge,
  Button,
  Flex,
  HStack,
  Image,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  Textarea,
  VStack
} from "@chakra-ui/react";
import { ChangeEvent, useState } from "react";
import { FaUpload } from 'react-icons/fa';
import { useAccount } from "wagmi";
import { updateProfileWithPrivateKey } from "@/lib/hive/server-functions";

interface EditModalProps {
  isOpen: boolean
  onClose(): void
  user: HiveAccount
}

const PINATA_GATEWAY_TOKEN = process.env.NEXT_PUBLIC_PINATA_GATEWAY_TOKEN
//console.log(PINATA_GATEWAY_TOKEN, "PINATA_GATEWAY_TOKEN")
export default function EditInfoModal({ isOpen, onClose, user }: EditModalProps) {

  const metadata = JSON.parse(user.posting_json_metadata).profile ? JSON.parse(user.posting_json_metadata) : (user.json_metadata ? JSON.parse(user.json_metadata) : {});
  const extMetadata = JSON.parse(user.json_metadata).extensions ? JSON.parse(user.json_metadata) : {};
  const [name, setName] = useState<string>(metadata?.profile.name || '');
  const [about, setAbout] = useState<string>(metadata?.profile.about || '');
  const [avatarUrl, setAvatarUrl] = useState<string>(metadata?.profile.profile_image || '');
  const [coverImageUrl, setCoverImageUrl] = useState<string>(metadata?.profile.cover_image || '');
  const [extensions, setExtensions] = useState<any>(
    (() => {
      try {
        return (extMetadata?.extensions) || "";
      } catch (error) {
        console.error("Error parsing JSON metadata:", error);
        return ""; 
      }
    })()
  );

  const [website, setWebsite] = useState<string>(metadata?.profile.website || '');
  const [selectedProfileFile, setSelectedProfileFile] = useState<File | null>(null);
  const [selectedCoverFile, setSelectedCoverFile] = useState<File | null>(null);
  const connecteWallet = useAccount().address;
  const [isEthSetupModalOpen, setIsEthSetupModalOpen] = useState(false);
  const [ethAddress, setEthAddress] = useState<string>(extensions?.eth_address || '');
  const [videoParts, setVideoParts] = useState<VideoPart[]>(extensions?.video_parts || '');


  async function handleProfileFileInputChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedProfileFile(file);
      const data = await uploadFileToIPFS(file)
      const ipfsUrl = `https://ipfs.skatehive.app/ipfs/${data.IpfsHash}?pinataGatewayToken=${PINATA_GATEWAY_TOKEN}`;
      setAvatarUrl(ipfsUrl)
    }
  }

  async function handleCoverFileInputChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedProfileFile(file);
      const data = await uploadFileToIPFS(file)
      const ipfsUrl = `https://ipfs.skatehive.app/ipfs/${data.IpfsHash}?pinataGatewayToken=${PINATA_GATEWAY_TOKEN}`;
      setAvatarUrl(ipfsUrl)
    }
  }

  async function sendEditTransaction() {
    const loginMethod = localStorage.getItem("LoginMethod")
    if (!user.name) {
      console.error("Username is missing")
      return
    }
    if (loginMethod === "keychain") {
      await updateProfile(user.name, name, about, coverImageUrl, avatarUrl, website, ethAddress, videoParts);
    } else if (loginMethod === "privateKey") {
      const encryptedPrivateKey = localStorage.getItem("EncPrivateKey");
      await updateProfileWithPrivateKey (encryptedPrivateKey, user.name, name, about, coverImageUrl, avatarUrl, website, ethAddress, videoParts)
    }
  }

  function handleClickaddEthAddress() {
    if (connecteWallet) {
      setEthAddress(connecteWallet);
    }
  }
  const EthSetupModal = () => {

    return (
      <Modal isOpen={isEthSetupModalOpen} onClose={() => setIsEthSetupModalOpen(false)} size="md">
        <ModalOverlay />
        <ModalContent bg={"black"} border={"0.6px solid grey"}>
          <ModalHeader>Is that your wallet? </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack>
              <Image boxSize={"128px"} src="https://img.gatenft.io/image/85d4d2e56f120f13834792477666294e.gif" alt=" eth" />
              <Badge fontSize={"14px"} m={5}> {connecteWallet} </Badge>
            </VStack>
            <Button colorScheme="green" variant={"outline"} w={'100%'} onClick={() => {
              handleClickaddEthAddress();
              setIsEthSetupModalOpen(false);
            }}> Confirm Address </Button>
          </ModalBody>
        </ModalContent>
      </Modal>
    )
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent bg={"black"} border={"0.6px solid grey"}>
        <ModalHeader>Edit Profile</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text> Name</Text>
          <Input
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Text> About</Text>
          <Textarea
            placeholder="About"
            value={about}
            onChange={(e) => setAbout(e.target.value)}

          />
          <Text> Avatar URL</Text>
          <HStack>
            <Input
              placeholder="Avatar URL"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
            />
            <Button colorScheme="green" variant="outline" mt={2} mb={2}>
              <label htmlFor="profileFileInput">
                <FaUpload />
              </label>
              <input
                type="file"
                id="profileFileInput"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleProfileFileInputChange}
              />
            </Button>
            {selectedProfileFile && (
              <div>
                {selectedProfileFile.name}
              </div>
            )}
          </HStack>
          <Text> Cover Image URL</Text>
          <HStack>

            <Input
              placeholder="Cover Image URL"
              value={coverImageUrl}
              onChange={(e) => setCoverImageUrl(e.target.value)}
            />
            <Button colorScheme="green" variant="outline" mt={2} mb={2}>
              <label htmlFor="coverFileInput">
                <FaUpload />
              </label>
              <input
                type="file"
                id="coverFileInput"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleCoverFileInputChange}
              />
            </Button>
          </HStack>
          {selectedCoverFile && (
            <div>
              {selectedCoverFile.name}
            </div>
          )}
          <Text> Website</Text>
          <Input
            placeholder="Website"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />

        </ModalBody>
        <Flex align="center" justify="center" direction="column">
          <Button colorScheme="blue" variant={"outline"} onClick={() => setIsEthSetupModalOpen(true)}> Add Ethereum Wallet Address </Button>
          <Text> {ethAddress} </Text>
        </Flex>
        <ModalFooter>
          <EthSetupModal />
          <Button w={"100%"} colorScheme="green" variant="outline" onClick={sendEditTransaction} >
            Save Changes
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}