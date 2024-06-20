'use client'

import { uploadFileToIPFS } from "@/app/upload/utils/uploadToIPFS";
import { updateProfile } from "@/lib/hive/client-functions";
import { updateProfileWithPrivateKey } from "@/lib/hive/server-functions";
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
import Select from 'react-select';
import countryList from 'react-select-country-list';
import { useAccount } from "wagmi";

interface EditModalProps {
  isOpen: boolean
  onClose(): void
  user: HiveAccount
  onUpdate(): void // Add this line
}

const PINATA_GATEWAY_TOKEN = process.env.NEXT_PUBLIC_PINATA_GATEWAY_TOKEN;

export default function EditInfoModal({ isOpen, onClose, user, onUpdate }: EditModalProps) { // Add onUpdate here
  const metadata = JSON.parse(user.posting_json_metadata).profile ? JSON.parse(user.posting_json_metadata) : (user.json_metadata ? JSON.parse(user.json_metadata) : {});
  const extMetadata = JSON.parse(user.json_metadata).extensions ? JSON.parse(user.json_metadata) : {};
  const [name, setName] = useState<string>(metadata?.profile.name || '');
  const [about, setAbout] = useState<string>(metadata?.profile.about || '');
  const [location, setLocation] = useState<string>(metadata?.profile.location || '');
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
  const connectedWallet = useAccount().address;
  const [isEthSetupModalOpen, setIsEthSetupModalOpen] = useState(false);
  const [ethAddress, setEthAddress] = useState<string>(extensions?.eth_address || '');
  const [videoParts, setVideoParts] = useState<VideoPart[]>(extensions?.video_parts || '');

  async function handleProfileFileInputChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedProfileFile(file);
      const data = await uploadFileToIPFS(file);
      const ipfsUrl = `https://ipfs.skatehive.app/ipfs/${data.IpfsHash}?pinataGatewayToken=${PINATA_GATEWAY_TOKEN}`;
      setAvatarUrl(ipfsUrl);
    }
  }

  async function handleCoverFileInputChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedCoverFile(file);
      const data = await uploadFileToIPFS(file);
      const ipfsUrl = `https://ipfs.skatehive.app/ipfs/${data.IpfsHash}?pinataGatewayToken=${PINATA_GATEWAY_TOKEN}`;
      setCoverImageUrl(ipfsUrl);
    }
  }

  async function sendEditTransaction() {
    const loginMethod = localStorage.getItem("LoginMethod");
    if (!user.name) {
      console.error("Username is missing");
      return;
    }
    if (loginMethod === "keychain") {
      await updateProfile(user.name, name, about, location, coverImageUrl, avatarUrl, website, ethAddress, videoParts);
      if (window) {
        window.location.reload();
      }
      onClose();
      onUpdate(); // Call onUpdate after closing the modal
    } else if (loginMethod === "privateKey") {
      const encryptedPrivateKey = localStorage.getItem("EncPrivateKey");
      await updateProfileWithPrivateKey(encryptedPrivateKey, user.name, name, about, location, coverImageUrl, avatarUrl, website, ethAddress, videoParts);
      if (window) {
        window.location.reload();
      }
      onClose();
      onUpdate(); // Call onUpdate after closing the modal
    }
  }

  function handleClickAddEthAddress() {
    if (connectedWallet) {
      setEthAddress(connectedWallet);
    }
  }

  const EthSetupModal = () => (
    <Modal isOpen={isEthSetupModalOpen} onClose={() => setIsEthSetupModalOpen(false)} size="md">
      <ModalOverlay />
      <ModalContent color={"white"} bg={"black"} border={"0.6px solid grey"}>
        <ModalHeader>Is that your wallet?</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack>
            <Image boxSize={"128px"} src="https://img.gatenft.io/image/85d4d2e56f120f13834792477666294e.gif" alt="eth" />
            <Badge fontSize={"14px"} m={5}>{connectedWallet}</Badge>
          </VStack>
          <Button colorScheme="green" variant={"outline"} w={'100%'} onClick={() => {
            handleClickAddEthAddress();
            setIsEthSetupModalOpen(false);
          }}>Confirm Address</Button>
        </ModalBody>
      </ModalContent>
    </Modal>
  );

  const countryOptions = countryList().getData();

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent color={"white"} bg={"black"} border={"0.6px solid grey"}>
        <ModalHeader>Edit Profile</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text>Name</Text>
          <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Text>About</Text>
          <Textarea placeholder="About" value={about} onChange={(e) => setAbout(e.target.value)} />
          <Text>Location</Text>
          <Select
            options={countryOptions}
            value={countryOptions.find(option => option.value === location)}
            onChange={(option: any) => setLocation(option.value)}
            formatOptionLabel={option => (
              <div style={{ backgroundColor: 'black', display: 'flex', alignItems: 'center' }}>
                <span style={{}}>{option.label}</span>
                <span style={{ marginLeft: 10 }}>{option.value}</span>
              </div>
            )}
          />
          <Text>Avatar URL</Text>
          <HStack>
            <Input placeholder="Avatar URL" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} />
            <Button colorScheme="green" variant="outline" mt={2} mb={2} onClick={() => document.getElementById('profileFileInput')?.click()}>
              <FaUpload />
              <Input type="file" id="profileFileInput" accept="image/*" style={{ display: 'none' }} onChange={handleProfileFileInputChange} />
            </Button>
            {selectedProfileFile && <Image src={URL.createObjectURL(selectedProfileFile)} alt="Profile Image" boxSize={10} />}
          </HStack>
          <Text>Cover Image URL</Text>
          <HStack>
            <Input placeholder="Cover Image URL" value={coverImageUrl} onChange={(e) => setCoverImageUrl(e.target.value)} />
            <Button colorScheme="green" variant="outline" mt={2} mb={2} onClick={() => document.getElementById('coverFileInput')?.click()}>
              <FaUpload />
              <Input type="file" id="coverFileInput" accept="image/*" style={{ display: 'none' }} onChange={handleCoverFileInputChange} />
            </Button>
            {selectedCoverFile && <Image src={URL.createObjectURL(selectedCoverFile)} alt="Cover Image" width={20} />}
          </HStack>
          <Text>Website</Text>
          <Input placeholder="Website" value={website} onChange={(e) => setWebsite(e.target.value)} />
        </ModalBody>
        <Flex align="center" justify="center" direction="column">
          <Button colorScheme="blue" variant={"outline"} onClick={() => setIsEthSetupModalOpen(true)}>Add Ethereum Wallet Address</Button>
          <Text>{ethAddress}</Text>
        </Flex>
        <ModalFooter>
          <EthSetupModal />
          <Button w={"100%"} colorScheme="green" variant="outline" onClick={sendEditTransaction}>Save Changes</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
