'use client'
import {
    Box,
    Button,
    Center,
    Checkbox,
    Flex,
    FormControl,
    HStack,
    Icon,
    Input,
    Text,
    VStack
} from '@chakra-ui/react';
import '@fontsource/creepster';
import * as dhive from '@hiveio/dhive';
import { KeyRole } from '@hiveio/dhive';
import { KeychainKeyTypes, KeychainRequestTypes, KeychainSDK } from 'keychain-sdk';
import { useEffect, useState } from 'react';
import { FaCheck, FaDownload, FaKey, FaTimes } from 'react-icons/fa';



const client = new dhive.Client([
    'https://api.hive.blog',
    'https://api.hivekings.com',
    'https://anyx.io',
    'https://api.openhive.network',
]);


import { useHiveUser } from '@/contexts/UserContext';
import { Operation } from '@hiveio/dhive';





const generatePassword = () => {
    const array = new Uint32Array(10);
    crypto.getRandomValues(array);

    const key = 'SKATE000' + dhive.PrivateKey.fromSeed(array.toString()).toString();
    return key.substring(0, 25);
}

const getPrivateKeys = (username: string, password: string, roles = ['owner', 'active', 'posting', 'memo']) => {
    const privKeys = {} as any;
    roles.forEach((role) => {
        privKeys[role] = dhive.PrivateKey.fromLogin(username, password, role as KeyRole).toString();
        privKeys[`${role}Pubkey`] = dhive.PrivateKey.from(privKeys[role]).createPublic().toString();
    });

    return privKeys;
};


const checkAccountExists = async (desiredUsername: string) => {
    try {
        const accounts = await client.database.getAccounts([desiredUsername]);
        return accounts.length === 0;
    } catch (error) {
        console.error('Error checking account:', error);
        return false;
    }
};

const copyToClipboard = (text: string) => {
    const el = document.createElement('textarea');
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
};

function AccountCreation() {
    const [desiredUsername, setDesiredUsername] = useState('');
    const [showSecondForm, setShowSecondForm] = useState(false);
    const [accountAvailable, setAccountAvailable] = useState(false);
    const [isCheckedOnce, setIsCheckedOnce] = useState(false);
    const [email, setEmail] = useState('');
    const [masterPassword, setMasterPassword] = useState('');
    const [keys, setKeys] = useState<any>(null);
    const [downloadText, setDownloadText] = useState('');
    const [areKeysDownloaded, setAreKeysDownloaded] = useState(false);
    const [charactersToShow, setCharactersToShow] = useState(0);
    const [textToDisplay, setTextToDisplay] = useState('');
    const user = useHiveUser();


    const handleCheck = async () => {
        if (desiredUsername) {
            const isAvailable = await checkAccountExists(desiredUsername);

            setIsCheckedOnce(true);

            if (isAvailable) {
                setShowSecondForm(true);
                setAccountAvailable(true);
            } else {
                console.log('Account already exists. Please choose a different desiredUsername.');
                setAccountAvailable(false);
            }
        } else {
            console.log('Please enter a username.');
        }
    };

    const handleGenerateKeys = () => {
        const masterPassword = generatePassword();
        setMasterPassword(masterPassword);

        const keys = getPrivateKeys(desiredUsername, masterPassword);
        setKeys(keys);

        let text = `Username: ${desiredUsername}\n\n`;
        text += `Master Password (Backup): ${masterPassword}\n\n`;
        text += `Owner Private Key: ${keys.owner}\n\n`;
        text += `Active Private Key: ${keys.active}\n\n`;
        text += `Posting Private Key: ${keys.posting}\n\n`;
        text += `Memo Private Key: ${keys.memo}\n\n\n\n`;
        text += `Email: ${email}\n`
        text += `Account created: ${new Date().toUTCString()}\n`;
        text += `Account created by: ${user.hiveUser?.name}\n`;
        text += `Account created on SKATEHIVE! - skatehive.app`;

        let displayText = `Username: ${desiredUsername}\n\n`;
        displayText += `Password: ${masterPassword}\n\n`;

        setDownloadText(text);
        setTextToDisplay(displayText);
    }

    const handleCreateAccount = async () => {
        try {
            const keychain = new KeychainSDK(window);
            let ops: Operation[] = [];
            if (user) {
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
                    username: user.hiveUser?.name ?? '',
                    operations: ops,
                    method: KeychainKeyTypes.active,
                };

                const broadcast = await keychain.broadcast(formParamsAsObject);
            } else {
                console.log('no user');
            }
        } catch (error) {
            console.error('Error during KeychainSDK interaction:', error);
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





    return (
        <Flex
            style={{
                backgroundImage: "url('https://i.ibb.co/Lv5C8rZ/nft-unscreen.gif')",
                backgroundSize: '100%',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                alignItems: 'center',
                justifyContent: 'center',
                flexWrap: 'wrap',
                width: '100%',
                height: '100vh',
            }}
        >

            <VStack spacing={3}>
                <Center>
                    <Text align={"center"} fontFamily="Creepster" fontSize="44px" color="white">Invite a Shredder to Skatehive</Text>
                </Center>
                <Text fontFamily="Creepster" fontSize="32px" color={"yellow"}>Choose a username!</Text>

                <Input
                    type='login'
                    placeholder="Enter Hive username"
                    backdropBlur={4}
                    bg={"black"}
                    maxW={"375px"}
                    value={desiredUsername}
                    onChange={(e) => setDesiredUsername(e.target.value)}
                    onKeyDown={handleKeyDown}

                />
                <HStack>

                    <Button colorScheme="yellow" border={"2px solid black"} onClick={handleCheck}>
                        Is it available?
                    </Button>
                    <Flex border={"2px solid yellow"} borderRadius="5px" bg={"black"} p={"5px"} align="center" display={isCheckedOnce ? 'flex' : 'none'}>
                        {accountAvailable ? (
                            <Icon as={FaCheck} color="green" />
                        ) : (
                            <Icon as={FaTimes} color="red" />
                        )}
                        <Text color={accountAvailable ? "yellow" : "white"} ml={2}>
                            {accountAvailable ? 'Account available' : 'Account unavailable'}
                        </Text>
                    </Flex>
                </HStack>

                {showSecondForm && (
                    <FormControl>
                        <Center>
                            <Button leftIcon={<FaKey />} colorScheme="yellow" border={"2px solid black"} onClick={handleGenerateKeys} marginTop={5}>
                                Generate Keys
                            </Button>
                        </Center>
                        <Flex
                            display={keys ? 'flex' : 'none'}
                            direction="column"
                            align="center"
                            justify="center"
                            marginTop={5}
                        >
                            <Box w={"90%"} border={"2px solid yellow"}>
                                <Text
                                    borderRadius="15"
                                    padding={5}
                                    background="#252525"
                                    fontSize={"14px"}
                                    whiteSpace="pre">
                                    {textToDisplay.slice(0, charactersToShow)}
                                </Text>
                            </Box>
                            <Flex mt={4} width="100%" gap={2} justifyContent="center" marginBottom={5}>

                                <Button leftIcon={<FaKey />} colorScheme="yellow" border={"2px solid black"} onClick={() => copyToClipboard(downloadText)}>
                                    Copy Keys
                                </Button>
                                <Button leftIcon={<FaDownload />} colorScheme="yellow" border={"2px solid black"} onClick={() => {
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
                            </Flex>


                        </Flex>
                        <Flex>

                            <Checkbox marginLeft={"15px"} colorScheme="teal" size="lg" isChecked={areKeysDownloaded} onChange={(e) => setAreKeysDownloaded(e.target.checked)}>
                                I have downloaded that shit and I wont lose it.
                            </Checkbox>

                        </Flex>
                        <Button w={"100%"} p="20px" colorScheme="yellow" border={"2px solid black"} onClick={handleCreateAccount} margin="10px" isDisabled={areKeysDownloaded ? false : true}>
                            Create Account
                        </Button>
                    </FormControl>
                )}
            </VStack>
        </Flex>
    );
}

export default AccountCreation;
