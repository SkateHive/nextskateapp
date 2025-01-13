'use client'
//import { Client, Operation, KeyRole, utils } from '@hiveio/dhive';
//import { KeychainKeyTypes, KeychainRequestTypes, KeychainSDK } from 'keychain-sdk';
//import { KeychainKeyTypes, KeychainRequestTypes } from 'keychain-sdk';
//import { KeychainRequestTypes, KeychainKeyTypes } from 'keychain-sdk';
import '@fontsource/creepster';
import { Operation } from '@hiveio/dhive'; 
import { KeychainSDK, KeychainRequestTypes, KeychainKeyTypes } from 'keychain-sdk';
import * as dhive from '@hiveio/dhive';

//import serverMailer from '../../lib/mailer/route';
import * as invites from '../../lib/mailer/invite-helpers';

import { Box, Button, Center, Checkbox, Flex, FormControl,
         Icon, Input, Text, VStack } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { FaCheck, FaDownload, FaKey, FaMailBulk, FaTimes } from 'react-icons/fa';
import { useHiveUser } from '@/contexts/UserContext';

function AccountCreation() {
    const [isLoading, setIsLoading] = useState(true);
    const [desiredUsername, setDesiredUsername] = useState('');
    const [desiredEmail, setDesiredEmail] = useState('');
    const [accountAvailable, setAccountAvailable] = useState(false);
    const [accountInvalid, setAccountInvalid] = useState<string | null>(null);
    const [isCheckedOnce, setIsCheckedOnce] = useState(false);
    const [masterPassword, setMasterPassword] = useState('');
    const [keys, setKeys] = useState<any>(null);
    const [areKeysDownloaded, setAreKeysDownloaded] = useState(false);
    const [charactersToShow, setCharactersToShow] = useState(0);

    const [broadcast_success, setBroadcastResult] = useState(false);
    const [broadcast_txid, setTxId] = useState('');
    const [broadcast_message, setBMessage] = useState('');

    const [email, setEmail] = useState('');
    const [showSecondForm, setShowSecondForm] = useState(false);
    const [textToDisplay, setTextToDisplay] = useState('');
    const [downloadText, setDownloadText] = useState('');
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

        // for debug
        console.log("handlecheck");
        sendTestEmail('test@test.com', 'test', []);
        // debug

        if(desiredEmail==""){
            setBroadcastResult(true);
            setBMessage("You forgot the fill up the email");
            // isEmailOk = false;
            // return
        } else {
            setBroadcastResult(false);
            setBMessage("");
            isEmailOk = true;
        }

        if (desiredUsername) {
            // console.log("desiredUsername: "+desiredUsername);
            isValidAccountName = invites.validateAccountName(desiredUsername);
            if(isValidAccountName !== null){
                // account is invalid, return error string
                setAccountInvalid(String(isValidAccountName));
            } else {
                setAccountInvalid('');
            }

            if(isValidAccountName === null){
                isAvailable = await invites.checkAccountExists(desiredUsername);
                setIsCheckedOnce(true);
            } else {
                isAvailable = false;
                setIsCheckedOnce(true);
            }

            // console.log("isValidAccountName: "+isValidAccountName);
            // console.log("isAvailable: "+isAvailable);
            if (isAvailable && (isValidAccountName === null)) {
                // console.log("Is Available");
                // console.log("isValidAccountName: "+isValidAccountName);
                // console.log("isAvailable: "+isAvailable);
                //setShowSecondForm(true);
                setAccountAvailable(true);
                // setAreKeysDownloaded(true);
                // handleGenerateKeys();
            } else {
                // console.log("Not Available");
                // console.log("isValidAccountName :"+isValidAccountName);
                // console.log("isAvailable :"+isAvailable);
                // console.log('Account already exists. Please choose a different desiredUsername.');
                //setShowSecondForm(false);
                
                setAccountAvailable(false);
                // setAreKeysDownloaded(false);
            }

            if (isEmailOk && isAvailable && (isValidAccountName === null)) {
                setAreKeysDownloaded(true);
                handleGenerateKeys();
            }
        } else {
            // console.log('Please enter a username.');
            setAccountAvailable(false);
        }
    };

    const handleGenerateKeys = () => {
        const masterPassword = invites.generatePassword();
        setMasterPassword(masterPassword);
        const keys = invites.getPrivateKeys(desiredUsername, masterPassword);
        setKeys(keys);
    }

    const handleCreateAccount = async () => {
        // const keychain = window?.hive_keychain;
        const keychain = new KeychainSDK(window);
        let ops: Operation[] = [];

        if (!keychain) {
            setBroadcastResult(true);
            setBMessage("Hive Keychain is probably not enabled");
            //console.log("keychain is probably not enabled");
            return;
        } else {
            // console.log("keychain is enabled. step1");
            setBroadcastResult(false);
            setBMessage("");
        }

        try {
            if (user.hiveUser?.name) {
                if(!keys) {
                    // console.log("no keys");
                    setBroadcastResult(true);
                    setBMessage("Issue with keys");
                    return;
                }

                const isKeychainInstalled = await keychain.isKeychainInstalled();
                console.log("is keychain installed? "+isKeychainInstalled);

                const createAccountOperation: Operation = [
                    'account_create',
                    {
                        fee: '3.000 HIVE',
                        creator: String(user.hiveUser?.name || ''),
                        new_account_name: desiredUsername,
                        owner: dhive.Authority.from(keys.ownerPubkey),
                        active: dhive.Authority.from(keys.activePubkey),
                        posting: dhive.Authority.from(keys.postingPubkey),
                        memo_key: keys.memoPubkey,
                        json_metadata: '',
                        extensions: [],
                    },
                ];

                ops.push(createAccountOperation);
                const formParamsAsObject = {
                    type: KeychainRequestTypes.broadcast,
                    username: user.hiveUser.name,
                    operations: ops,
                    method: KeychainKeyTypes.active,
                };

                try {

                    const broadcast = await keychain.broadcast(formParamsAsObject);
                    //console.log(broadcast);

                    if(broadcast.success) {
                        console.log("invites.sendInviteEmail result:");
                        const invitation = invites.sendInviteEmail(desiredEmail, desiredUsername, user.hiveUser.name, masterPassword, keys);
                        console.log(invitation);
                        setBroadcastResult(true);
                        //setTxId(broadcast.result.tx_id);
                        setBMessage(broadcast.message);
                        console.log(broadcast.result?.tx_id);
                        console.log(broadcast.message);
                    } else {
                        setBroadcastResult(true);
                        setBMessage(broadcast.error + ": " + broadcast.message);
                        console.log(broadcast.message);
                        console.log(broadcast.error);
                    }
                } catch (error:any){
                    //console.log("error broadcasting: ");
                    console.log(error);
                    setBroadcastResult(true);
                    setBMessage(error.message);
                }
            } else {
                setBroadcastResult(true);
                setBMessage("no logged hive user");
                //console.log('no logged hive user');
            }
        } catch (error) {
            setBroadcastResult(true);
            setBMessage('Error during Keychain interaction:' + error);
            console.error('Error during Keychain interaction:', error);
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
        if (event.key === 'Enter') {
            handleCheck();
        }
    };

    if(isLoading) {
        return (
            <Flex style={{
                backgroundImage: "url('/spinning-joint-sm.gif')",
                backgroundSize: '10%',
                backgroundPosition: 'center center',
                backgroundRepeat: 'no-repeat',
                alignItems: 'center',
                justifyContent: 'center',
                flexWrap: 'wrap',
                width: '100%',
                height: '100vh',
                color: 'white',
            }}>
                <VStack>
        <>
        <Center>
          <Text align={"center"} fontFamily="Creepster" fontSize="44px" 
          color="green" textShadow="2px 2px white">
            Rolling...</Text>
        </Center>
        </>
        </VStack>
            </Flex>
        )
    }

    if(!user.hiveUser?.name) {
      // need to login
      return (
        <Flex style={{
        backgroundImage: "url('/boardslideerro404.gif')",
        backgroundSize: '65%',
        backgroundPosition: 'top center',
        backgroundRepeat: 'no-repeat',
        alignItems: 'center',
        justifyContent: 'center',
        flexWrap: 'wrap',
        width: '100%',
        height: '100vh',
        color: 'white',
    }}>
        <VStack>
        <>
        <Center>
          <Text align={"center"} fontFamily="Creepster" fontSize="44px" 
          color="red" textShadow="2px 2px yellow">
            You need Login before Invite!</Text>
        </Center>
        </>
        </VStack>
      
      <VStack>
        <Center>
            <Button w={"100%"} p="20px" 
              alignContent={"center"}
              colorScheme="green" 
              border={"2px solid black"} 
              onClick={handleCreateAccount} 
              margin="10px" 
              display={'none'}
              isDisabled={areKeysDownloaded ? false : true}>
              TEST are keys downloaded 
            </Button>
          </Center>
      </VStack>

      <VStack>
        <Center>
            <Button w={"100%"} p="20px" 
              alignContent={"center"}
              colorScheme="green" 
              border={"2px solid black"} 
              onClick={handleCreateAccount} 
              margin="10px" 
              display={'none'}
              isDisabled={false}>
              TEST Create Account and Send Keys
            </Button>
            <Text>.</Text>
          </Center>
      </VStack>
  </Flex>);

    } else 
      // user is in
      return (
<Flex style={{
        backgroundImage: "url('/nft-unscreen.gif')",
        backgroundSize: '20%',
        backgroundPosition: 'top center',
        backgroundRepeat: 'no-repeat',
        alignItems: 'center',
        justifyContent: 'center',
        flexWrap: 'wrap',
        width: '100%',
        height: '100vh',
        color: 'white',
    }}>
<VStack spacing={3}>
    <Center>
      <Text align={"center"} fontFamily="Creepster" fontSize="44px" color="white">Invite a Shredder to Skatehive</Text>
    </Center>
      <Text fontFamily="Creepster" fontSize="32px" color={"yellow"}>
        Your buddy nickname. Choose wisely!</Text>

      <Input type='login'
            placeholder="Friend's desired Hive Nickname"
            backdropBlur={4}
            bg={"black"}
            maxW={"375px"}
            value={desiredUsername}
            onChange={(e) => setDesiredUsername(e.target.value)}
            onKeyDown={handleKeyDown} />

      <Text fontFamily="Creepster" fontSize="32px" color={"yellow"}>Your buddy email</Text>
      <Input type='email'
            placeholder="Friend's email"
            backdropBlur={4}
            bg={"black"}
            maxW={"375px"}
            value={desiredEmail}
            onChange={(e) => setDesiredEmail(e.target.value)}
            onKeyDown={handleKeyDown} />

    <VStack>
        <Flex border={"2px solid yellow"} borderRadius="5px" bg={"black"} p={"5px"} align="center" display={isCheckedOnce ? 'flex' : 'none'}>
            {accountAvailable 
                ? ( <Icon as={FaCheck} color="green" /> ) 
                : ( <Icon as={FaTimes} color="red" /> )}

            <Text color={accountAvailable ? "yellow" : "white"} ml={2}>
                {accountAvailable 
                    ? 'Yeah!! Account available. Drop it!' 
                    : 'Please choose other nickname! ' + accountInvalid}
            </Text>
        </Flex>

        <Center>
            {desiredUsername && (
            <Button display={'block'} 
                colorScheme="yellow" 
                border={"2px solid black"} 
                onClick={handleCheck}>
                    Check if @{desiredUsername} is available!
            </Button>
            )}
        </Center>
    </VStack>

    <VStack>
        {desiredUsername != '' && (
        <Text>Create Account and Send keys to {desiredUsername} at {desiredEmail}.</Text>
        )}
    </VStack>
    <VStack>
      <FormControl>
          <Center>
            <Button w={"100%"} p="20px" 
              alignContent={"center"}
              colorScheme="green" 
              border={"2px solid black"} 
              onClick={handleCreateAccount} 
              margin="10px" 
              isDisabled={areKeysDownloaded ? false : true}>
               Looks Good, Lets go for it!
            </Button>
          </Center>
      </FormControl>
    </VStack>

    {broadcast_success && (
        <VStack>
            <Text id="BroadcastResults"
                    borderRadius="15"
                    borderColor={'yellow'}
                    padding={5}
                    background="#252525"
                    fontSize={"14px"}
                    whiteSpace="pre">
                {broadcast_message}
            </Text>
        </VStack>
    )}

  {showSecondForm && (
      <FormControl>
          <Button leftIcon={<FaKey />} colorScheme="yellow" 
              border={"2px solid black"} 
              onClick={handleGenerateKeys} 
              marginTop={5}>
              Generate Keys</Button>
          <Flex display={keys ? 'flex' : 'none'}
                  direction="column"
                  align="center"
                  justify="center"
                  marginTop={5} >
              <Box w={"90%"}>
                  <Text id="hiddenSecretKeys"
                          borderRadius="15"
                          display="none"
                          borderColor={'yellow'}
                          padding={5}
                          background="#252525"
                          fontSize={"14px"}
                          whiteSpace="pre">
                      {textToDisplay.slice(0, charactersToShow)}
                  </Text>
              </Box>
              <Flex mt={4} width="100%" gap={2} justifyContent="center" marginBottom={5}>
                  <Button leftIcon={<FaKey />} colorScheme="yellow" 
                          border={"2px solid black"} 
                          onClick={() => invites.copyToClipboard(downloadText)}>
                      Copy Keys
                  </Button>
                  <Button leftIcon={<FaDownload />} colorScheme="yellow" 
                          border={"2px solid black"} 
                          onClick={() => {
                              const element = document.createElement("a");
                              const file = new Blob([downloadText], { type: 'text/plain' });
                              element.href = URL.createObjectURL(file);
                              element.download = `KEYS BACKUP - @${desiredUsername.toUpperCase()}.txt`;
                              document.body.appendChild(element);
                              element.click();
                              setAreKeysDownloaded(true); 
                          }}>
                          Download Keys
                  </Button>
                  <Button leftIcon={<FaMailBulk />} colorScheme="yellow" 
                  border={"2px solid black"} 
                  onClick={() => invites.copyToClipboard(downloadText)}>
                      Send via e-mail
                  </Button>
              </Flex>
          </Flex>
          <Flex>
              <Checkbox display={'none'}
                      marginLeft={"15px"} 
                      colorScheme="teal" 
                      size="lg" 
                      isChecked={areKeysDownloaded} 
                      onChange={(e) => setAreKeysDownloaded(e.target.checked)}>
                  I have downloaded that shit and I wont lose it.
              </Checkbox>
          </Flex>
          <Center>
            <Button w={"100%"} p="20px" 
              alignContent={"center"}
              colorScheme="green" 
              border={"2px solid black"} 
              onClick={handleCreateAccount} 
              margin="10px" 
              isDisabled={areKeysDownloaded ? false : true}>
              Create Account and Send Keys via Email
            </Button>
          </Center>
      </FormControl>
    )}
</VStack>
</Flex>
);

}

export default AccountCreation;
