// path : src/app/upload/hiveUpload.tsx

// lets make a function to import in our upload page.tsx and use it to upload content to hive 

import { Client } from "@hiveio/dhive";
import useAuthHiveUser from "@/lib/useHiveAuth";
import { useHiveUser } from "@/contexts/UserContext";
import * as dhive from "@hiveio/dhive"

import CryptoJS from "crypto-js";
import { commentWithPrivateKey } from "@/lib/hive/server-functions";
import { comment } from "@uiw/react-md-editor";
const slugify = (text: string) => {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text
}

const generatePermlink = (title: string) => {
    const slugifiedTitle = slugify(title);
    const timestamp = new Date().getTime(); // Ensures uniqueness
    return `${slugifiedTitle}-${timestamp}`;
};


const hiveUpload = async (username: string, title: string, body: string, beneficiariesArray: any[], thumbnail: string, tags: any[], user: any) => {
    if (localStorage.getItem('LoginMethod') === 'keychain') {
        if (user && title) {
            if (username) {
                const permlink = slugify(title.toLowerCase());
                const formatBeneficiaries = (beneficiariesArray: any[]) => {
                    let seen = new Set();
                    let finalBeneficiaries = beneficiariesArray.filter(({ account }: { account: string }) => {
                        const duplicate = seen.has(account);
                        seen.add(account);
                        return !duplicate;
                    }).map(beneficiary => ({
                        account: beneficiary.account,
                        weight: parseInt(beneficiary.weight, 10) // Ensure weight is an integer
                    }));

                    // Sort beneficiaries by account name to maintain consistency
                    finalBeneficiaries = finalBeneficiaries.sort((a, b) => a.account.localeCompare(b.account));
                    return finalBeneficiaries;
                };

                // Use this function in your hiveUpload to prepare beneficiaries:
                let finalBeneficiaries = formatBeneficiaries(beneficiariesArray);

                const commentOptions = {
                    author: username,
                    permlink: permlink,
                    max_accepted_payout: '10000.000 HBD',
                    percent_hbd: 10000,
                    allow_votes: true,
                    allow_curation_rewards: true,
                    extensions: [
                        [0, {
                            beneficiaries: finalBeneficiaries
                        }]
                    ]
                };

                // Add defaultFooter to the markdown if includeFooter is true
                // if (includeFooter) {
                //     const link = `https://skatehive.app/post/hive-173115/@${username}/${permlink}`;

                //     let newFooter = "\n" + "> **Check this post on** " + `[Skatehive App](${link})`

                //     // set the final markdown text again
                //     finalMarkdown = finalMarkdown + newFooter;

                //     setMarkdownText((prevMarkdown) => prevMarkdown + newFooter);
                // }

                // Define the post operation
                const postOperation = [
                    'comment',
                    {
                        parent_author: '',
                        parent_permlink: generatePermlink(title),
                        // parent_permlink: process.env.COMMUNITY || 'hive-173115',
                        author: username,
                        permlink: permlink,
                        title: title,
                        body: body,
                        json_metadata: JSON.stringify({
                            tags: tags,
                            app: 'Skatehive App',
                            image: thumbnail,
                        }),
                    },
                ];

                console.log("Post Operation:", postOperation);

                // Define the comment options operation
                const commentOptionsOperation = ['comment_options', commentOptions];

                // Construct the operations array
                const operations = [postOperation, commentOptionsOperation];
                console.log("Öperations ", operations);
                // Request the broadcast using Hive Keychain
                window.hive_keychain.requestBroadcast(username, operations, 'posting', async (response: any) => {
                    if (response.success) {

                        console.log(response);
                    } else {
                        alert('Error publishing post on Hive');
                        console.error('Error publishing post on Hive:', response.message);
                    }
                });
            } else {
                alert('You have to log in with Hive Keychain to use this feature...');
            }
        }
    }
    else if (localStorage.getItem('LoginMethod') === 'privateKey') {
        if (user && title) {
            if (username) {
                const permlink = slugify(title.toLowerCase());
                const formatBeneficiaries = (beneficiariesArray: any[]) => {
                    let seen = new Set();
                    let finalBeneficiaries = beneficiariesArray.filter(({ account }: { account: string }) => {
                        const duplicate = seen.has(account);
                        seen.add(account);
                        return !duplicate;
                    }).map(beneficiary => ({
                        account: beneficiary.account,
                        weight: parseInt(beneficiary.weight, 10) // Ensure weight is an integer
                    }));

                    // Sort beneficiaries by account name to maintain consistency
                    finalBeneficiaries = finalBeneficiaries.sort((a, b) => a.account.localeCompare(b.account));
                    return finalBeneficiaries;
                };

                // Use this function in your hiveUpload to prepare beneficiaries:
                let finalBeneficiaries = formatBeneficiaries(beneficiariesArray);

                const commentOptions: dhive.CommentOptionsOperation = ['comment_options', {
                    author: username,
                    permlink: permlink,
                    max_accepted_payout: '10000.000 HBD',
                    percent_hbd: 10000,
                    allow_votes: true,
                    allow_curation_rewards: true,
                    extensions: [
                        [0, {
                            beneficiaries: finalBeneficiaries
                        }]
                    ]
                }];
                const postOperation: dhive.CommentOperation = [
                    'comment',
                    {
                        parent_author: '',
                        parent_permlink: generatePermlink(title),
                        // parent_permlink: process.env.COMMUNITY || 'hive-173115',
                        author: username,
                        permlink: permlink,
                        title: title,
                        body: body,
                        json_metadata: JSON.stringify({
                            tags: tags,
                            app: 'Skatehive App',
                            image: thumbnail,
                        }),
                    },
                ];

                console.log("Post Operation:", postOperation);


                // Construct the operations array
                const operations = [postOperation, commentOptions];
                console.log("Öperations ", operations);

                commentWithPrivateKey(localStorage.getItem("EncPrivateKey"), postOperation, commentOptions);
            }
        }




    }
};


export default hiveUpload;