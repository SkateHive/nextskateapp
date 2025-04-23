"use client";
//import { Client, Operation, KeyRole, utils } from '@hiveio/dhive';
//import { KeychainKeyTypes, KeychainRequestTypes, KeychainSDK } from 'keychain-sdk';
//import { KeychainKeyTypes, KeychainRequestTypes } from 'keychain-sdk';
//import { KeychainRequestTypes, KeychainKeyTypes } from 'keychain-sdk';
import "@fontsource/creepster";
import { Operation } from "@hiveio/dhive";
import {
  KeychainSDK,
  KeychainRequestTypes,
  KeychainKeyTypes,
} from "keychain-sdk";
import * as dhive from "@hiveio/dhive";
import { useRouter } from "next/navigation"; // Add this import

//import serverMailer from '../../lib/mailer/route';
import * as invites from "../../lib/mailer/invite-helpers";

import {
  Box,
  Button,
  Center,
  Checkbox,
  Flex,
  FormControl,
  Icon,
  Input,
  Text,
  VStack,
  Switch,
  Select,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import {
  FaCheck,
  FaDownload,
  FaKey,
  FaMailBulk,
  FaTimes,
} from "react-icons/fa";
import { useHiveUser } from "@/contexts/UserContext";

function AccountCreation() {
  const router = useRouter(); // Add this line
  const [isLoading, setIsLoading] = useState(true);
  const [desiredUsername, setDesiredUsername] = useState("");
  const [desiredEmail, setDesiredEmail] = useState("");
  const [accountAvailable, setAccountAvailable] = useState(false);
  const [accountInvalid, setAccountInvalid] = useState<string | null>(null);
  const [isCheckedOnce, setIsCheckedOnce] = useState(false);
  const [masterPassword, setMasterPassword] = useState("");
  const [keys, setKeys] = useState<any>(null);
  const [areKeysDownloaded, setAreKeysDownloaded] = useState(false);
  const [charactersToShow, setCharactersToShow] = useState(0);
  const [useAccountToken, setUseAccountToken] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("EN"); // Default language is English

  const [broadcast_success, setBroadcastResult] = useState(false);
  const [broadcast_txid, setTxId] = useState("");
  const [broadcast_message, setBMessage] = useState("");

  const [email, setEmail] = useState("");
  const [showSecondForm, setShowSecondForm] = useState(false);
  const [textToDisplay, setTextToDisplay] = useState("");
  const [downloadText, setDownloadText] = useState("");
  const user = useHiveUser();

  useEffect(() => {
    const interval = setInterval(() => {
      setIsLoading(false);
    }, 1000); // 1000 milliseconds = 1 second
    // Clear the interval when the component unmounts to prevent memory leaks
    return () => clearInterval(interval);
  }, []);

  const handleCheck = async () => {
    var isValidAccountName = null;
    var isAvailable = false;
    var isEmailOk = false;

    setBroadcastResult(false);
    setBMessage("");

    if (desiredEmail == "") {
      setBroadcastResult(true);
      setBMessage("You forgot the fill up the email");
    } else {
      setBroadcastResult(false);
      setBMessage("");
      isEmailOk = true;
    }

    if (desiredUsername) {
      isValidAccountName = invites.validateAccountName(desiredUsername);
      if (isValidAccountName !== null) {
        setAccountInvalid(String(isValidAccountName));
      } else {
        setAccountInvalid("");
      }

      if (isValidAccountName === null) {
        isAvailable = await invites.checkAccountExists(desiredUsername);
        setIsCheckedOnce(true);
      } else {
        isAvailable = false;
        setIsCheckedOnce(true);
      }

      if (isAvailable && isValidAccountName === null) {
        setAccountAvailable(true);
      } else {
        setAccountAvailable(false);
      }

      if (isEmailOk && isAvailable && isValidAccountName === null) {
        setAreKeysDownloaded(true);
        handleGenerateKeys();
      }
    } else {
      setAccountAvailable(false);
    }
  };

  const handleGenerateKeys = () => {
    const masterPassword = invites.generatePassword();
    setMasterPassword(masterPassword);
    const keys = invites.getPrivateKeys(desiredUsername, masterPassword);
    setKeys(keys);
  };

  const handleCreateAccount = async () => {
    const keychain = new KeychainSDK(window);
    let ops: Operation[] = [];

    if (!keychain) {
      setBroadcastResult(true);
      setBMessage("Hive Keychain is probably not enabled");
      return;
    } else {
      setBroadcastResult(false);
      setBMessage("");
    }

    try {
      if (user.hiveUser?.name) {
        if (!keys) {
          setBroadcastResult(true);
          setBMessage("Issue with keys");
          return;
        }

        const isKeychainInstalled = await keychain.isKeychainInstalled();
        console.log("is keychain installed? " + isKeychainInstalled);

        let createAccountOperation: Operation;
        if (useAccountToken) {
          createAccountOperation = [
            "create_claimed_account",
            {
              creator: String(user.hiveUser?.name || ""),
              new_account_name: desiredUsername,
              owner: dhive.Authority.from(keys.ownerPubkey),
              active: dhive.Authority.from(keys.activePubkey),
              posting: dhive.Authority.from(keys.postingPubkey),
              memo_key: keys.memoPubkey,
              json_metadata: "",
              extensions: [],
            },
          ];
        } else {
          createAccountOperation = [
            "account_create",
            {
              fee: "3.000 HIVE",
              creator: String(user.hiveUser?.name || ""),
              new_account_name: desiredUsername,
              owner: dhive.Authority.from(keys.ownerPubkey),
              active: dhive.Authority.from(keys.activePubkey),
              posting: dhive.Authority.from(keys.postingPubkey),
              memo_key: keys.memoPubkey,
              json_metadata: "",
              extensions: [],
            },
          ];
        }

        ops.push(createAccountOperation);
        const formParamsAsObject = {
          type: KeychainRequestTypes.broadcast,
          username: user.hiveUser.name,
          operations: ops,
          method: KeychainKeyTypes.active,
        };

        try {
          const broadcast = await keychain.broadcast(formParamsAsObject);

          if (broadcast.success) {
            console.log("invites.sendInviteEmail result:");
            const invitation = invites.sendInviteEmail(
              desiredEmail,
              desiredUsername,
              user.hiveUser.name,
              masterPassword,
              keys,
              selectedLanguage // Pass the selected language
            );
            console.log(invitation);
            setBroadcastResult(true);
            setBMessage(broadcast.message);
            console.log(broadcast.result?.tx_id);
            console.log(broadcast.message);
          } else {
            setBroadcastResult(true);
            setBMessage(broadcast.error + ": " + broadcast.message);
            console.log(broadcast.message);
            console.log(broadcast.error);
          }
        } catch (error: any) {
          console.log(error);
          setBroadcastResult(true);
          setBMessage(error.message);
        }
      } else {
        setBroadcastResult(true);
        setBMessage("no logged hive user");
      }
    } catch (error) {
      setBroadcastResult(true);
      setBMessage("Error during Keychain interaction:" + error);
      console.error("Error during Keychain interaction:", error);
    }
  };

  useEffect(() => {
    const intervalTime = 30;
    const timer = setInterval(() => {
      setCharactersToShow((prevChars) => {
        if (prevChars >= downloadText.length) {
          clearInterval(timer);
        }
        return prevChars + 1;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [downloadText]);

  const handleKeyDown = (event: any) => {
    if (event.key === "Enter") {
      handleCheck();
    }
  };

  if (isLoading) {
    return (
      <Flex
        style={{
          backgroundImage: "url('/spinning-joint-sm.gif')",
          backgroundSize: "10%",
          backgroundPosition: "center center",
          backgroundRepeat: "no-repeat",
          alignItems: "center",
          justifyContent: "center",
          flexWrap: "wrap",
          width: "100%",
          height: "100vh",
          color: "white",
        }}
      >
        <VStack>
          <>
            <Center>
              <Text
                align={"center"}
                fontFamily="Creepster"
                fontSize="44px"
                color="green"
                textShadow="2px 2px white"
              >
                Rolling...
              </Text>
            </Center>
          </>
        </VStack>
      </Flex>
    );
  }

  if (!user.hiveUser?.name) {
    // need to login
    return (
      <Flex
        style={{
          backgroundImage: "url('/boardslideerro404.gif')",
          backgroundSize: "65%",
          backgroundPosition: "top center",
          backgroundRepeat: "no-repeat",
          alignItems: "center",
          justifyContent: "center",
          flexWrap: "wrap",
          width: "100%",
          height: "100vh",
          color: "white",
        }}
      >
        <VStack>
          <>
            <Center>
              <Text
                align={"center"}
                fontFamily="Creepster"
                fontSize="44px"
                color="red"
                textShadow="2px 2px yellow"
              >
                You need Login before Invite!
              </Text>
            </Center>
          </>
        </VStack>

        <VStack>
          <Center>
            <Button
              w={"100%"}
              p="20px"
              alignContent={"center"}
              colorScheme="green"
              border={"2px solid black"}
              onClick={handleCreateAccount}
              margin="10px"
              display={"none"}
              isDisabled={areKeysDownloaded ? false : true}
            >
              TEST are keys downloaded
            </Button>
          </Center>
        </VStack>

        <VStack>
          <Center>
            <Button
              w={"100%"}
              p="20px"
              alignContent={"center"}
              colorScheme="green"
              border={"2px solid black"}
              onClick={handleCreateAccount}
              margin="10px"
              display={"none"}
              isDisabled={false}
            >
              TEST Create Account and Send Keys
            </Button>
            <Text>.</Text>
          </Center>
        </VStack>
      </Flex>
    );
  } else
    // user is in
    return (
      <Flex
        direction="column"
        align="center"
        justify="flex-start"
        style={{
          backgroundImage: "url('/nft-unscreen.gif')",
          backgroundSize: "20%",
          backgroundPosition: "top center",
          backgroundRepeat: "no-repeat",
          width: "100%",
          height: "100vh",
          color: "white",
          overflowY: "auto", // Allow scrolling
          padding: "20px", // Add padding for better spacing
        }}
      >
        <Button
          onClick={() => router.back()}
          colorScheme="yellow"
          border={"2px solid black"}
          marginBottom="20px"
          alignSelf="flex-start" // Align the button to the top-left
        >
          Go Back
        </Button>

        <Text
          align="center"
          fontFamily="Creepster"
          fontSize="36px"
          color="white"
          marginBottom="20px"
          textShadow="2px 2px black" // Add text shadow for better readability
        >
          Invite a Shredder to Skatehive
        </Text>

        <Text
          fontFamily="Creepster"
          fontSize="24px"
          color="yellow"
          marginBottom="10px"
          textAlign="center" // Center-align the text
        >
          Your buddy nickname. Choose wisely!
        </Text>
        <Input
          type="login"
          placeholder="Friend's desired Hive Nickname"
          backdropBlur={4}
          bg={"black"}
          maxW={"375px"}
          value={desiredUsername}
          onChange={(e) => setDesiredUsername(e.target.value)}
          marginBottom="20px"
        />

        <Text
          fontFamily="Creepster"
          fontSize="24px"
          color="yellow"
          marginBottom="10px"
          textAlign="center" // Center-align the text
        >
          Your buddy email
        </Text>
        <Input
          type="email"
          placeholder="Friend's email"
          backdropBlur={4}
          bg={"black"}
          maxW={"375px"}
          value={desiredEmail}
          onChange={(e) => setDesiredEmail(e.target.value)}
          marginBottom="20px"
        />

        <Text
          fontFamily="Creepster"
          fontSize="24px"
          color="yellow"
          marginBottom="10px"
          textAlign="center" // Center-align the text
        >
          Choose Account Creation Method
        </Text>
        <Switch
          isChecked={useAccountToken}
          onChange={() => setUseAccountToken(!useAccountToken)}
          marginBottom="10px"
        />
        <Text
          fontFamily="Creepster"
          fontSize="18px"
          color="yellow"
          marginBottom="20px"
          textAlign="center" // Center-align the text
        >
          {useAccountToken ? "Using Account Creation Token" : "Paying 3 HIVE"}
        </Text>

        <Text
          fontFamily="Creepster"
          fontSize="24px"
          color="yellow"
          marginBottom="10px"
          textAlign="center" // Center-align the text
        >
          Choose Email Language
        </Text>
        <Select
          maxW={"375px"}
          bg={"black"}
          color={"white"}
          value={selectedLanguage}
          onChange={(e) => setSelectedLanguage(e.target.value)}
          marginBottom="20px"
        >
          <option value="EN">English</option>
          <option value="PT-BR">Português (Brasil)</option>
          <option value="ES">Español</option>
        </Select>

        <Button
          colorScheme="yellow"
          border={"2px solid black"}
          onClick={handleCheck}
          marginBottom="20px"
          isDisabled={!desiredUsername || !desiredEmail}
        >
          Check if @{desiredUsername} is available!
        </Button>

        {isCheckedOnce && (
          <Flex
            border={"2px solid yellow"}
            borderRadius="5px"
            bg={"black"}
            p={"10px"}
            align="center"
            marginBottom="20px"
          >
            {accountAvailable ? (
              <Icon as={FaCheck} color="green" />
            ) : (
              <Icon as={FaTimes} color="red" />
            )}
            <Text
              color={accountAvailable ? "yellow" : "white"}
              ml={2}
              textAlign="center" // Center-align the text
            >
              {accountAvailable
                ? "Yeah!! Account available. Drop it!"
                : "Please choose another nickname! " + accountInvalid}
            </Text>
          </Flex>
        )}

        <Button
          w={"100%"}
          p="20px"
          colorScheme="green"
          border={"2px solid black"}
          onClick={handleCreateAccount}
          isDisabled={!areKeysDownloaded}
          marginBottom="20px"
        >
          Looks Good, Let's Go For It!
        </Button>

        {broadcast_success && (
          <Text
            id="BroadcastResults"
            borderRadius="15"
            borderColor={"yellow"}
            padding={5}
            background="#252525"
            fontSize={"14px"}
            whiteSpace="pre"
            marginBottom="20px"
            textAlign="center" // Center-align the text
          >
            {broadcast_message}
          </Text>
        )}
      </Flex>
    );
}

export default AccountCreation;
