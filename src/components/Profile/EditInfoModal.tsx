"use client";

import { uploadFileToIPFS } from "@/app/upload/utils/uploadToIPFS";
import { updateProfile } from "@/lib/hive/client-functions";
import { updateProfileWithPrivateKey } from "@/lib/hive/server-functions";
import { HiveAccount } from "@/lib/useHiveAuth";
import { VideoPart } from "@/lib/hive/client-functions";
import HiveClient from "@/lib/hive/hiveclient";
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
  VStack,
} from "@chakra-ui/react";
import {
  ChangeEvent,
  JSXElementConstructor,
  ReactElement,
  ReactFragment,
  ReactPortal,
  memo,
  useCallback,
  useMemo,
  useState,
} from "react";
import { FaUpload } from "react-icons/fa";
import Select from "react-select";
import countryList from "react-select-country-list";
import { useAccount } from "wagmi";
import { useUserData } from "@/contexts/UserContext";

interface EditModalProps {
  isOpen: boolean;
  onClose(): void;
  user: HiveAccount;
  onUpdate(): void;
}

const PINATA_GATEWAY_TOKEN = process.env.NEXT_PUBLIC_PINATA_GATEWAY_TOKEN;

const EditInfoModal = memo(
  ({ isOpen, onClose, user, onUpdate }: EditModalProps) => {
    const hiveUser = useUserData();

    const safeParse = (jsonString: string) => {
      try {
        return JSON.parse(jsonString);
      } catch (error) {
        return null;
      }
    };

    const postingMetadata = safeParse(user.posting_json_metadata);
    const jsonMetadata = safeParse(user.json_metadata);

    const metadata = postingMetadata?.profile
      ? postingMetadata
      : jsonMetadata?.profile
        ? jsonMetadata
        : {};
    const extMetadata = jsonMetadata?.extensions ? jsonMetadata : {};

    const [name, setName] = useState<string>(metadata?.profile?.name || "");
    const [about, setAbout] = useState<string>(metadata?.profile?.about || "");
    const [location, setLocation] = useState<string>(
      metadata?.profile?.location || ""
    );
    const [avatarUrl, setAvatarUrl] = useState<string>(
      metadata?.profile?.profile_image || ""
    );
    const [coverImageUrl, setCoverImageUrl] = useState<string>(
      metadata?.profile?.cover_image || ""
    );
    const [extensions, setExtensions] = useState<any>(
      extMetadata?.extensions || {}
    );

    const [website, setWebsite] = useState<string>(
      metadata?.profile?.website || ""
    );
    const [selectedProfileFile, setSelectedProfileFile] = useState<File | null>(
      null
    );
    const [selectedCoverFile, setSelectedCoverFile] = useState<File | null>(
      null
    );
    const connectedWallet = useAccount().address;
    const [isEthSetupModalOpen, setIsEthSetupModalOpen] = useState(false);
    const [ethAddress, setEthAddress] = useState<string>(
      extensions?.eth_address || ""
    );
    const [videoParts, setVideoParts] = useState<VideoPart[]>(
      extensions?.video_parts || []
    );
    const [level, setLevel] = useState<number>(extensions?.level || 0);
    const [staticXp, setStaticXp] = useState<number>(extensions?.staticXp || 0);
    const [cumulativeXp, setCumulativeXp] = useState<number>(
      extensions?.cumulativeXp || 0
    );

    const handleProfileFileInputChange = useCallback(
      async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
          setSelectedProfileFile(file);
          const data = await uploadFileToIPFS(file);
          const ipfsUrl = `https://ipfs.skatehive.app/ipfs/${data.IpfsHash}`;
          setAvatarUrl(ipfsUrl);
        }
      },
      []
    );

    const handleCoverFileInputChange = useCallback(
      async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
          setSelectedCoverFile(file);
          const data = await uploadFileToIPFS(file);
          const ipfsUrl = `https://ipfs.skatehive.app/ipfs/${data.IpfsHash}`;
          setCoverImageUrl(ipfsUrl);
        }
      },
      []
    );

    const sendEditTransaction = useCallback(async () => {
      const loginMethod = localStorage.getItem("LoginMethod");
      if (!user.name) {
        console.error("Username is missing");
        return;
      }
      if (loginMethod === "keychain") {
        await updateProfile(
          user.name,
          name,
          about,
          location,
          coverImageUrl,
          avatarUrl,
          website,
          ethAddress,
          videoParts,
          level,
          staticXp,
          cumulativeXp
        );
        // Fetch latest user data from blockchain and update localStorage
        const accounts = await HiveClient.database.getAccounts([user.name]);
        if (accounts && accounts[0]) {
          const freshUser = accounts[0] as any;
          // Merge metadata for easier access
          try {
            freshUser.metadata = JSON.parse(
              freshUser.posting_json_metadata || freshUser.json_metadata || "{}"
            );
          } catch (e) {
            freshUser.metadata = {};
          }
          localStorage.setItem("hiveuser", JSON.stringify(freshUser));
        }
        // Replace refreshUser usage if needed
        onClose();
        onUpdate();
        // refreshpage
        window.location.reload();
      } else if (loginMethod === "privateKey") {
        const encryptedPrivateKey = localStorage.getItem("EncPrivateKey");
        await updateProfileWithPrivateKey(
          encryptedPrivateKey,
          user.name,
          name,
          about,
          location,
          coverImageUrl,
          avatarUrl,
          website,
          ethAddress,
          videoParts,
          level,
          staticXp
        );
        // Fetch latest user data from blockchain and update localStorage
        const accounts = await HiveClient.database.getAccounts([user.name]);
        if (accounts && accounts[0]) {
          const freshUser = accounts[0] as any;
          try {
            freshUser.metadata = JSON.parse(
              freshUser.posting_json_metadata || freshUser.json_metadata || "{}"
            );
          } catch (e) {
            freshUser.metadata = {};
          }
          localStorage.setItem("hiveuser", JSON.stringify(freshUser));
        }
        // Replace refreshUser usage if needed
        onClose();
        onUpdate();
        // refreshpage
        window.location.reload();
      }
    }, [
      user.name,
      name,
      about,
      location,
      coverImageUrl,
      avatarUrl,
      website,
      ethAddress,
      videoParts,
      level,
      staticXp,
      cumulativeXp,
      onClose,
      onUpdate,
    ]);

    const handleClickAddEthAddress = useCallback(() => {
      if (connectedWallet) {
        setEthAddress(connectedWallet);
      }
    }, [connectedWallet]);

    const handleCloseEthModal = useCallback(() => {
      setIsEthSetupModalOpen(false);
    }, []);

    const handleOpenEthModal = useCallback(() => {
      setIsEthSetupModalOpen(true);
    }, []);

    const handleConfirmEthAddress = useCallback(() => {
      handleClickAddEthAddress();
      setIsEthSetupModalOpen(false);
    }, [handleClickAddEthAddress]);

    const countryOptions = useMemo(() => countryList().getData(), []);

    const selectedCountryOption = useMemo(
      () => countryOptions.find((option) => option.value === location),
      [countryOptions, location]
    );

    const handleLocationChange = useCallback((option: any) => {
      setLocation(option.value);
    }, []);

    const handleNameChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setName(e.target.value);
      },
      []
    );

    const handleAboutChange = useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setAbout(e.target.value);
      },
      []
    );

    const handleAvatarUrlChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setAvatarUrl(e.target.value);
      },
      []
    );

    const handleCoverImageUrlChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setCoverImageUrl(e.target.value);
      },
      []
    );

    const handleWebsiteChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setWebsite(e.target.value);
      },
      []
    );

    const handleProfileFileClick = useCallback(() => {
      document.getElementById("profileFileInput")?.click();
    }, []);

    const handleCoverFileClick = useCallback(() => {
      document.getElementById("coverFileInput")?.click();
    }, []);

    const EthSetupModal = () => (
      <Modal
        isOpen={isEthSetupModalOpen}
        onClose={() => setIsEthSetupModalOpen(false)}
        size="md"
      >
        <ModalOverlay />
        <ModalContent color={"white"} bg={"black"} border={"0.6px solid grey"}>
          <ModalHeader>Is that your wallet?</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack>
              <Image
                boxSize={"128px"}
                src="https://img.gatenft.io/image/85d4d2e56f120f13834792477666294e.gif"
                alt="eth"
              />
              {connectedWallet ? (
                <Badge fontSize={"14px"} m={5}>
                  {connectedWallet}
                </Badge>
              ) : (
                <Badge fontSize={"14px"} m={5}>
                  {"Connect your Wallet first!"}
                </Badge>
              )}
            </VStack>
            {connectedWallet ? (
              <Button
                colorScheme="green"
                variant={"outline"}
                w={"100%"}
                onClick={() => {
                  handleClickAddEthAddress();
                  setIsEthSetupModalOpen(false);
                }}
              >
                Confirm Address
              </Button>
            ) : (
              <Button
                colorScheme="green"
                variant={"outline"}
                w={"100%"}
                onClick={() => {
                  setIsEthSetupModalOpen(false);
                }}
              >
                Latter
              </Button>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    );

    return (
      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <ModalOverlay />
        <ModalContent color={"white"} bg={"black"} border={"0.6px solid grey"}>
          <ModalHeader>Edit Profile</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>Name</Text>
            <Input
              placeholder="Name"
              value={name}
              onChange={handleNameChange}
              id="name-input"
              name="name"
            />
            <Text>About</Text>
            <Textarea
              placeholder="About"
              value={about}
              onChange={handleAboutChange}
            />
            <Text>Location</Text>
            <Select
              styles={{
                control: (provided: any, state: any) => ({
                  ...provided,
                  backgroundColor: "white",
                  color: "black",
                  borderColor: state.isFocused ? "#63b3ed" : "black",
                  boxShadow: state.isFocused ? "0 0 0 1px #63b3ed" : "none",
                  "&:hover": {
                    borderColor: "#63b3ed",
                  },
                }),
              }}
              options={countryOptions}
              value={selectedCountryOption}
              onChange={handleLocationChange}
              formatOptionLabel={(option: {
                value:
                  | string
                  | number
                  | boolean
                  | ReactElement<any, string | JSXElementConstructor<any>>
                  | ReactFragment
                  | ReactPortal
                  | null
                  | undefined;
                label:
                  | string
                  | number
                  | boolean
                  | ReactElement<any, string | JSXElementConstructor<any>>
                  | ReactFragment
                  | ReactPortal
                  | null
                  | undefined;
              }) => (
                <div style={{ display: "flex", alignItems: "center" }}>
                  <span style={{ color: "black" }}>{option.value} - </span>
                  <span style={{ color: "black", marginLeft: 10 }}>
                    {option.label}
                  </span>
                </div>
              )}
            />
            <Text>Avatar URL</Text>
            <HStack>
              <Input
                placeholder="Avatar URL"
                value={avatarUrl}
                onChange={handleAvatarUrlChange}
              />
              <Button
                colorScheme="green"
                variant="outline"
                mt={2}
                mb={2}
                onClick={handleProfileFileClick}
              >
                <FaUpload />
                <Input
                  type="file"
                  id="profileFileInput"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleProfileFileInputChange}
                />
              </Button>
              {selectedProfileFile && (
                <Image
                  src={URL.createObjectURL(selectedProfileFile)}
                  alt="Profile Image"
                  boxSize={10}
                />
              )}
            </HStack>
            <Text>Cover Image URL</Text>
            <HStack>
              <Input
                placeholder="Cover Image URL"
                value={coverImageUrl}
                onChange={handleCoverImageUrlChange}
              />
              <Button
                colorScheme="green"
                variant="outline"
                mt={2}
                mb={2}
                onClick={handleCoverFileClick}
              >
                <FaUpload />
                <Input
                  type="file"
                  id="coverFileInput"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleCoverFileInputChange}
                />
              </Button>
              {selectedCoverFile && (
                <Image
                  src={URL.createObjectURL(selectedCoverFile)}
                  alt="Cover Image"
                  width={20}
                />
              )}
            </HStack>
            <Text>Website</Text>
            <Input
              placeholder="Website"
              value={website}
              onChange={handleWebsiteChange}
            />
          </ModalBody>
          <Flex align="center" justify="center" direction="column">
            <Button
              colorScheme="blue"
              variant={"outline"}
              onClick={handleOpenEthModal}
            >
              Add Ethereum Wallet Address
            </Button>
            <Text>{ethAddress}</Text>
          </Flex>
          <ModalFooter>
            <EthSetupModal />
            <Button
              w={"100%"}
              colorScheme="green"
              variant="outline"
              onClick={sendEditTransaction}
            >
              Save Changes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  }
);

EditInfoModal.displayName = "EditInfoModal";

export default EditInfoModal;
