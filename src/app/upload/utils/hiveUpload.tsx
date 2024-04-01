// path : src/app/upload/hiveUpload.tsx

// lets make a function to import in our upload page.tsx and use it to upload content to hive 

import { Client } from "@hiveio/dhive";
import useAuthHiveUser from "@/lib/useHiveAuth";
import { useHiveUser } from "@/contexts/UserContext";

const slugify = (text: string) => {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text
}


const hiveUpload = async (username: string, title: string, body: string, beneficiariesArray: any[], thumbnail: string, tags: any[],) => {
    const user = useHiveUser();
    console.log(user || "no user")

    if (user && title) {
        const username = user
        if (username) {
            const permlink = slugify(title.toLowerCase());

            // Define the beneficiaries
            let finalBeneficiaries = beneficiariesArray.map(b => ({
                account: b.account,
                weight: parseInt(b.weight, 10) // Convert the weight string to an integer
            }));




            // Define your comment options (e.g., max_accepted_payout, beneficiaries, etc.)
            const commentOptions = {
                author: username,
                permlink: permlink, // Use the video permlink if video is uploaded on 3Speak
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
                    // parent_permlink: 'testing798',
                    parent_permlink: process.env.COMMUNITY || 'hive-173115',
                    author: username,
                    permlink: permlink, // Use the video permlink if video is uploaded on 3Speak
                    title: title,
                    body: body, // Use the complete post body here
                    json_metadata: JSON.stringify({
                        tags: tags, // Pass the 'tags' array here
                        app: 'Skatehive App',
                        image: thumbnail, // Replace 'thumbnailIpfsURL' with 'thumbnailUrl'
                    }),
                },
            ];

            // Define the comment options operation
            const commentOptionsOperation = ['comment_options', commentOptions];

            // Construct the operations array
            const operations = [postOperation, commentOptionsOperation];
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
};

export default hiveUpload;