import { commentWithKeychain } from "@/lib/hive/client-functions";
import { commentWithPrivateKey } from "@/lib/hive/server-functions";
import { HiveAccount } from "@/lib/useHiveAuth";
import {
  Box,
  Button,
  Center,
  Divider,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  VStack,
} from "@chakra-ui/react";
import React, { useState } from "react";

import slugify from "../utils/slugify";
import BeneficiariesTable from "./BeneficiariesTable";
import { createCommentOptions, createPostOperation } from "./formatPostData";
import PostPreview from "./PostPreview";
import SocialsModal from "./socialsModal";
import TagsTable from "./TagsTable";
import useSummary from "./useSummary";

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  body: string;
  thumbnailUrl: string;
  user: HiveAccount;
  beneficiariesArray: any[];
  tags: string[];
}

const PreviewModal: React.FC<PreviewModalProps> = ({
  isOpen,
  onClose,
  title,
  body,
  thumbnailUrl,
  user,
  beneficiariesArray,
  tags,
}) => {
  const [hasPosted, setHasPosted] = useState(false);
  const AiSummary = useSummary(body);
  const permlink = slugify(title.toLowerCase());
  const postLink = user?.name
    ? `${window.location.origin}/post/hive-173115/@${user.name}/${permlink}`
    : "";
  const characterCount = body.length;
  const [isMinCarcterCountReached, setIsMinCarcterCountReached] = useState(
    characterCount >= 350
  );
  const parent_perm =
    process.env.NEXT_PUBLIC_PARENT_PERM || "default-parent-perm"; // Ensure parent_perm is always a string
  const defaultThumbnail =
    "https://ipfs.skatehive.app/ipfs/QmWgkeX38hgWNh7cj2mTvk8ckgGK3HSB5VeNn2yn9BEnt7?pinataGatewayToken=nxHSFa1jQsiF7IHeXWH-gXCY3LDLlZ7Run3aZXZc8DRCfQz4J4a94z9DmVftXyFE";
  const imageMatches = [...body.matchAll(/!\[.*?\]\((.*?)\)/g)];
  const imagesInBody = imageMatches.map((match) => match[1]);
  const hasImageInBody = imagesInBody.length > 0;
  const effectiveThumbnail =
    thumbnailUrl && thumbnailUrl !== defaultThumbnail
      ? thumbnailUrl
      : imagesInBody.length > 0
        ? imagesInBody[0]
        : defaultThumbnail;

  let postDataForPreview = {
    post_id: Number(1),
    author: user?.name || "skatehive",
    permlink: "permlink",
    title: title,
    body: body,
    json_metadata: JSON.stringify({ images: [defaultThumbnail] }),
    created: String(Date.now()),
    url: "url",
    root_title: "root_title",
    total_payout_value: "4.20",
    curator_payout_value: "0.0",
    pending_payout_value: "0.0",
    active_votes: [
      {
        voter: "BamMargera",
        weight: 10000,
        percent: "0",
        reputation: 78,
        rshares: 0,
      },
      {
        voter: "SpiderMan",
        weight: 5000,
        percent: "0",
        reputation: 69,
        rshares: 0,
      },
      {
        voter: "Magnolia",
        weight: 20000,
        percent: "0",
        reputation: 100,
        rshares: 0,
      },
    ],
  };
  const formatBeneficiaries = (beneficiariesArray: any[]) => {
    let seen = new Set();
    return beneficiariesArray
      .filter(({ account }: { account: string }) => {
        const duplicate = seen.has(account);
        seen.add(account);
        return !duplicate;
      })
      .map((beneficiary) => ({
        account: beneficiary.account,
        weight: parseInt(beneficiary.weight, 10), // Ensure weight is an integer
      }))
      .sort((a, b) => a.account.localeCompare(b.account));
  };

  const finalBeneficiaries = formatBeneficiaries(beneficiariesArray);

  const handlePost = async () => {
    if (!isMinCarcterCountReached) {
      alert(
        "Your post is too short for the Magazine Section. Please add more content or post in the Main Feed."
      );
      return;
    }
    if (!hasImageInBody) {
      alert(
        "You must include at least one image in your Magazine post body (markdown image)."
      );
      return;
    }

    const permlink = slugify(title.toLowerCase());
    const loginMethod = localStorage.getItem("LoginMethod");

    if (!user || !title || !user.name) {
      if (loginMethod === "keychain") {
        alert("Something wrong is not right...");
      }
      return;
    }

    const formParamsAsObject = {
      username: user.name,
      title: title,
      body: body,
      parent_perm: parent_perm,
      json_metadata: JSON.stringify({
        format: "markdown",
        description: AiSummary,
        tags: tags,
        image: [effectiveThumbnail],
      }),
      permlink: permlink,
      comment_options: JSON.stringify({
        author: user.name,
        permlink: permlink,
        max_accepted_payout: "10000.000 HBD",
        percent_hbd: 10000,
        allow_votes: true,
        allow_curation_rewards: true,
        extensions: [
          [
            0,
            {
              beneficiaries: finalBeneficiaries,
            },
          ],
        ],
      }),
    };

    if (loginMethod === "keychain") {
      const response = await commentWithKeychain(formParamsAsObject);
      if (response?.success) {
        setHasPosted(true);
      } else {
        alert("Something went wrong, please try again");
      }
    } else if (loginMethod === "privateKey") {
      const commentOptions = createCommentOptions(
        user,
        permlink,
        finalBeneficiaries
      );
      const postOperation = createPostOperation(
        user,
        permlink,
        title,
        body,
        tags,
        effectiveThumbnail
      );
      commentWithPrivateKey(
        localStorage.getItem("EncPrivateKey"),
        postOperation,
        commentOptions
      );
      setHasPosted(true);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay style={{ backdropFilter: "blur(5px)" }} />
      <ModalContent
        position={"absolute"}
        color={"white"}
        backgroundColor={"black"}
        border={"1px solid #A5D6A7"}
      >
        {hasPosted ? (
          <SocialsModal
            isOpen={hasPosted}
            onClose={onClose}
            postUrl={postLink}
            content={body}
            aiSummary={AiSummary}
          />
        ) : (
          <>
            <ModalHeader>Post Preview (Review details)</ModalHeader>
            <Divider />
            <ModalCloseButton />

            {characterCount < 350 && (
              <Box
                bg={"yellow"}
                color="red"
                textAlign="center"
                fontSize="sm"
                fontWeight="bold"
                p={2}
              >
                Your post is too short for the Magazine Section. Please add more
                content or post in the Main Feed.
              </Box>
            )}
            {!hasImageInBody && characterCount >= 350 && (
              <Box
                mt={1}
                bg={"yellow"}
                color="red"
                textAlign="center"
                fontSize="sm"
                fontWeight="bold"
                p={2}
              >
                You must include at least one image in your Magazine post body
                (markdown image).
              </Box>
            )}
            {characterCount > 350 &&
              thumbnailUrl === defaultThumbnail &&
              hasImageInBody && (
                <Box
                  mt={1}
                  bg={"yellow"}
                  color="orange"
                  textAlign="center"
                  fontSize="sm"
                  fontWeight="bold"
                  p={2}
                >
                  No thumbnail selected. The first image in your post will be
                  used as the thumbnail.
                </Box>
              )}

            <ModalBody>
              <Box>
                <Center>
                  <VStack>
                    <Box maxWidth={"90%"}>
                      <PostPreview postData={postDataForPreview} />
                    </Box>
                    <Box border={"1px solid white"} w="80%">
                      <BeneficiariesTable
                        beneficiariesArray={finalBeneficiaries}
                      />
                      <TagsTable tags={tags} />
                    </Box>
                  </VStack>
                </Center>
              </Box>
            </ModalBody>
            <ModalFooter>
              <VStack width={"100%"}>
                <Button width={"100%"} colorScheme="red" onClick={onClose}>
                  Let me try again, I am high{" "}
                </Button>
                <Button width={"100%"} colorScheme="green" onClick={handlePost}>
                  Looks dope, confirm!
                </Button>
              </VStack>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default PreviewModal;
