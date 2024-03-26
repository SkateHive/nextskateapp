'use client';
import React, { useState, useEffect } from 'react';
import {
  Box,
  Textarea,
  Button,
  Flex,
  HStack,
  Modal,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  Input,
  Text,
  Image,
  useToast,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,

} from '@chakra-ui/react';

import { FaEthereum, FaHive } from 'react-icons/fa';
import { Client } from "@hiveio/dhive";
// import EditProfileModal from 'lib/pages/profile/editProfileModal';
import { Grid } from '@giphy/react-components'
import { GiphyFetch } from '@giphy/js-fetch-api'
import { IGif } from '@giphy/js-types'
import { Spinner } from '@chakra-ui/react';
import sendHive from './sendHive';
interface CommentBoxProps {
  user: any;
  parentAuthor: string;
  parentPermlink: string;
  onCommentPosted: () => void;
}

const CommentBox: React.FC<CommentBoxProps> = ({ user, parentAuthor, parentPermlink, onCommentPosted }) => {
  const [commentContent, setCommentContent] = useState('');
  const [isHiveLoginModalOpen, setHiveLoginModalOpen] = useState(false);
  const [isSendHiveTipModalOpen, setSendHiveTipModalOpen] = useState(false);
  const [isEthAddressPresent, setIsEthAddressPresent] = useState(false);
  const [authorEthAddress, setEthAddress] = useState<string>('');
  const [isSendEthTipModalOpen, setSendEthTipModalOpen] = useState(false);
  const [message, setMessage] = useState("");
  const toast = useToast();
  const [isEditProfileModalOpen, setEditProfileModalOpen] = useState(false);

  useEffect(() => {
    const fetchEthAddress = async () => {
      if (parentAuthor) {
        try {
          const client = new Client('https://api.hive.blog');
          const response = await client.database.getAccounts([parentAuthor]);

          if (Array.isArray(response) && response.length > 0) {
            const authorMetadata = JSON.parse(response[0].json_metadata).extensions;

            if (authorMetadata && authorMetadata.eth_address) {
              setIsEthAddressPresent(true);
              setEthAddress(authorMetadata.eth_address);
            }
          }
        } catch (error) {
          console.error('Error fetching account data:', error);
        }
      }
    };

    fetchEthAddress();
  }, [parentAuthor]);

  const handleCommentSubmit = () => {
    if (!window.hive_keychain) {
      console.error("Hive Keychain extension not found!");
      return;
    }

    const username = user?.name;
    if (!username) {
      console.error("Username is missing");
      return;
    }

    const permlink = new Date().toISOString().replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

    const operations = [
      ["comment",
        {
          "parent_author": parentAuthor,
          "parent_permlink": parentPermlink,
          "author": username,
          "permlink": permlink,
          "title": "",
          "body": commentContent,
          "json_metadata": JSON.stringify({ tags: ["skateboard"], app: "skatehive" })
        }
      ]
    ];

    window.hive_keychain.requestBroadcast(username, operations, "posting", (response: any) => {
      if (response.success) {
        setCommentContent('');
        onCommentPosted();
      } else {
        console.error("Error posting comment:", response.message);
      }
    });
  };


  // const sendHiveTipModal = () => {
  //   const [defaultMemo, setDefaultMemo] = useState("Awesome Post!")
  //   return (
  //     <Modal isOpen={isSendHiveTipModalOpen} onClose={() => setSendHiveTipModalOpen(false)}>
  //       <ModalContent minW={"30%"} bg={"black"} border={"3px solid red"}>
  //         <ModalCloseButton color={"red"} />
  //         <ModalHeader>Send Hive Tip to {parentAuthor}</ModalHeader>
  //         <center>

  //           <Image boxSize={"148px"} src="assets/santapepe.png"></Image>
  //         </center>
  //         <HStack p="10px" justifyContent={"space-between"} m={"20px"}>
  //           <Button
  //             leftIcon={<FaHive color='red' />}
  //             border="3px solid red"
  //             mt="10px"
  //             onClick={() => sendHive("0.1", parentAuthor || '', defaultMemo, user?.name)}
  //             bg={"transparent"}
  //             color={"white"}
  //           > 0.1 </Button>
  //           <Button
  //             leftIcon={<FaHive color='red' />}
  //             border="3px solid red"
  //             mt="10px"
  //             onClick={() => sendHive("1", parentAuthor || '', defaultMemo, user?.name)}
  //             bg={"transparent"}
  //             color={"white"}
  //           > 1 </Button>
  //           <Button
  //             leftIcon={<FaHive color='red' />}
  //             border="3px solid red"
  //             mt="10px"
  //             onClick={() => sendHive("10", parentAuthor || '', defaultMemo, user?.name)}
  //             bg={"transparent"}
  //             color={"white"}
  //           > 10 </Button>
  //           <Button
  //             leftIcon={<FaHive color='red' />}
  //             border="3px solid red"
  //             mt="10px"
  //             onClick={() => sendHive("50", parentAuthor || '', defaultMemo, user?.name)}
  //             bg={"transparent"}
  //             color={"white"}
  //           > 50 </Button>
  //         </HStack>
  //         <Box p="10px" textAlign="center">
  //           <Text textAlign="center" color={"white"}>Or enter a custom amount:</Text>

  //           <Input margin={"2px"} placeholder="Custom Amount"
  //             onChange={(e) => setCommentContent(e.target.value)}
  //             maxW={"60%"}
  //           />
  //           <Box p="10px" textAlign="center">
  //             <Text textAlign="center" color={"white"}>Send a Message with Transaction</Text>
  //             <Input margin={"2px"} placeholder="Custom Message"
  //               onChange={(e) => setDefaultMemo(e.target.value)}
  //               maxW={"60%"}
  //             />
  //           </Box>
  //           <Button
  //             leftIcon={<FaHive />}
  //             border="1px solid white"
  //             marginLeft={"10px"}
  //             onClick={() => sendHive(commentContent, parentAuthor || '', defaultMemo, user?.name)}
  //           >Tip {commentContent} HIVE</Button>
  //         </Box>
  //       </ModalContent>
  //     </Modal>
  //   );
  // }



  const handleHiveTipClick = () => {
    setSendHiveTipModalOpen(true);
  }

  const handleEthereumTipClick = () => {
    if (parentAuthor) {
      const fetchData = async () => {
        try {
          const client = new Client('https://api.hive.blog');
          const response = await client.database.getAccounts([parentAuthor]);

          if (Array.isArray(response) && response.length > 0) {
            const authorMetadata = JSON.parse(response[0].json_metadata).extensions;

            if (authorMetadata && authorMetadata.eth_address) {
              setIsEthAddressPresent(true);
              setEthAddress(authorMetadata.eth_address);
              setSendEthTipModalOpen(true);
              sendEthTipToast();
            } else {
              sendEthTipToast();
            }
          } else {
            console.log('Invalid response from getAccounts');
          }
        } catch (error) {
          console.error('Error fetching account data:', error);
        }
      };
      fetchData();
    } else {
      console.log('parent author is not present');
    }
  };

  const sendEthTipToast = () => {
    let status: 'info' | 'success' | 'error' = 'info';
    let title = 'Ethereum Tip';
    let description = '';
    let duration = 3000;

    if (!isEthAddressPresent) {
      description = 'This user has not set an Ethereum address yet. Don´t let it happen with you, close this to add yours!';
      status = 'error';
      duration = 10000;
    } else {
      const copyEthAddressToClipboard = () => {
        navigator.clipboard.writeText(authorEthAddress);
      };
      copyEthAddressToClipboard();
      description = 'Copied ' + authorEthAddress + ' to clipboard.';
      status = 'success';
      duration = 3000;
    }

    toast({
      title,
      description,
      status,
      duration,
      isClosable: true,
      onCloseComplete: () => {
        if (!isEthAddressPresent) {
          setEditProfileModalOpen(true);
        }
      },
    });
  };

  const [isGiphyModalOpen, setGiphyModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('skateboard funny');
  const [selectedGif, setSelectedGif] = useState(null);
  const [gifs, setGifs] = useState<IGif[]>([]); // Correctly type the gifs state
  const [isLoading, setIsLoading] = useState(false);
  const gf = new GiphyFetch('qXGQXTPKyNJByTFZpW7Kb0tEFeB90faV')
  const fetchGifs = (offset: number) => gf.trending({ offset, limit: 10 })

  useEffect(() => {
    // This useEffect should fetch GIFs either trending or based on searchTerm
    const fetch = async () => {
      const { data } = searchTerm
        ? await gf.search(searchTerm, { limit: 10 })
        : await gf.trending({ limit: 10 });
      setGifs(data); // Set the fetched GIFs to state
    };

    fetch();
  }, [searchTerm]);
  const onGifSelect = (gif: any, e: any) => {
    e.preventDefault();
    const gifUrl = gif.images.downsized_medium.url; // Adjust according to the GIF object structure
    setSelectedGif(gif);
    setCommentContent((prevContent) => `${prevContent} ![](${gifUrl})`);
    setGiphyModalOpen(false); // Close the modal after selection
  };

  const handleSearchTermChange = (value: string) => {
    setTimeout(() => {
      setSearchTerm(value);
    }, 5000);
    setIsLoading(false);
  };
  const GiphyModal = () => {
    // Modal content with Input for searchTerm
    // Use the Grid component with a corrected fetchGifs prop
    return (
      <Modal isOpen={isGiphyModalOpen} onClose={() => setGiphyModalOpen(false)}>
        <ModalContent bg={"black"}>
          <ModalHeader>Search GIPHY</ModalHeader>
          <ModalCloseButton />
          <Input
            placeholder="Type to search..."
            onChange={(e) => {
              setIsLoading(true);
              handleSearchTermChange(e.target.value);
            }} // Directly set the searchTerm
          />
          {isLoading && <Spinner />}
          <Grid
            width={450}
            columns={3}
            fetchGifs={(offset) => gf.search(searchTerm, { offset, limit: 10 })} // Correctly use fetchGifs
            onGifClick={onGifSelect}
          />
        </ModalContent>
      </Modal>
    );
  };

  return (
    <Box margin={"10px"} borderRadius={"10px"} border="1px solid white" padding="10px" mt="20px">
      <Textarea
        value={commentContent}
        onChange={(e) => setCommentContent(e.target.value)}
        placeholder="Write your comment here..."
      />
      <HStack justifyContent={"space-between"}>
        <HStack justifyContent={"space-between"}>

          <Button mt="10px" color={"white"} bg={"transparent"} border={"1px solid white"} onClick={() => setGiphyModalOpen(true)}>Add GIF</Button>
          <GiphyModal />


          <Menu>
            <MenuButton color={"white"} bg={"black"} as={Button} leftIcon={<Image boxSize={"38px"} src="/assets/pepelove.png" />} border="1px solid white" mt="10px">
              Tip
            </MenuButton>
            <MenuList bg={"black"}>
              <MenuItem as={Button} leftIcon={<FaEthereum color='#7CC4FA' />} bg={"black"} onClick={handleEthereumTipClick} _hover={{ bg: 'white', color: 'black' }}>
                Ethereum Tip
              </MenuItem>
              <MenuItem as={Button} leftIcon={<FaHive color='red' />} bg={"black"} onClick={handleHiveTipClick} _hover={{ bg: 'white', color: 'black' }}>

                Hive Tip
              </MenuItem>
            </MenuList>
          </Menu>
        </HStack>
        <Button border="1px solid white" mt="10px" onClick={handleCommentSubmit}>
          Submit Comment
        </Button>

      </HStack>

      {/* {sendHiveTipModal()}
      {isEditProfileModalOpen && (
        <EditProfileModal user={user} isOpen={true} onClose={() => setEditProfileModalOpen(false)} />
      )}

      {isHiveLoginModalOpen && (
        <HiveLogin isOpen={true} onClose={() => setHiveLoginModalOpen(false)} />
      )} */}
    </Box>
  );
};

export default CommentBox;
