'use client'

import { useEffect, useState, ChangeEvent } from "react"
import {
  Box,
  Button,
  Input,
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  Textarea,
  Center,
  VStack,
  HStack,
} from "@chakra-ui/react"
import { FaUpload } from 'react-icons/fa';
import { uploadFileToIPFS } from "@/app/upload/utils/uploadToIPFS";
import { useAccount } from "wagmi";
import { HiveAccount } from "@/lib/models/user"
import { updateProfile } from "@/lib/hive/client-functions";

interface PostModalInterface {
  isOpen: boolean
  onClose(): void
  user: HiveAccount
}

const PINATA_GATEWAY_TOKEN = process.env.NEXT_PUBLIC_PINATA_GATEWAY_TOKEN

export default function EditInfoModal({ isOpen, onClose, user }: PostModalInterface) {

  const [name, setName] = useState<string>(user.metadata?.profile.name || '');
  const [about, setAbout] = useState<string>(user.metadata?.profile.about || '');
  const [avatarUrl, setAvatarUrl] = useState<string>(user.metadata?.profile.profile_image || '');
  const [coverImageUrl, setCoverImageUrl] = useState<string>(user.metadata?.profile.cover_image || '');
  const current_extensions = user?.json_metadata;

  const [extensions, setExtensions] = useState<any>(
    (() => {
      try {
        return (JSON.parse(user?.json_metadata)?.extensions) || "";
      } catch (error) {
        console.error("Error parsing JSON metadata:", error);
        return ""; // or set a default value based on your requirements
      }
    })()
  );

  const [website, setWebsite] = useState<string>(user.metadata?.profile.website || '');
  const [selectedProfileFile, setSelectedProfileFile] = useState<File | null>(null);
  const [selectedCoverFile, setSelectedCoverFile] = useState<File | null>(null);
  const [connectedAddress, setConnectedAddress] = useState<string>('');
  //const { state } = usePioneer();
  //const { app, status } = state;
  const [isEthSetupModalOpen, setIsEthSetupModalOpen] = useState(false);
  const [ethAddress, setEthAddress] = useState<string>(extensions?.eth_address || '');

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
    await updateProfile(user.name, name, about, coverImageUrl, avatarUrl, website, ethAddress, []);
  }

  function handleClickaddEthAddress() {

  }

  const EthSetupModal = () => {

    return (
      <Modal isOpen={isEthSetupModalOpen} onClose={() => setIsEthSetupModalOpen(false)} size="md">
        <ModalOverlay />
        <ModalContent bg={"black"} border={"1px solid limegreen"}>
          <ModalHeader>Connect Ethereum Wallet</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text> Confirm Address </Text>
            <Text> {connectedAddress} </Text>
            <Button onClick={handleClickaddEthAddress}> Add Address </Button>
          </ModalBody>
        </ModalContent>
      </Modal>
    )
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent bg={"black"} border={"1px solid limegreen"}>
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
            <Button color={"limegreen"} border={"1px dashed limegreen"} variant="ghost" mt={2} mb={2}>
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
            <Button color={"limegreen"} border={"1px dashed limegreen"} variant="ghost" mt={2} mb={2}>
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
          <Button onClick={() => setIsEthSetupModalOpen(true)}> Add Ethereum Wallet Address </Button>
          <Text> {ethAddress} </Text>
        </Flex>
        <ModalFooter>
          <EthSetupModal />
          <Button colorScheme="red" mr={3} onClick={onClose}>
            Close
          </Button>
          <Button color={"limegreen"} border={"1px dashed limegreen"} onClick={sendEditTransaction} variant="ghost">
            Save Changes
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}