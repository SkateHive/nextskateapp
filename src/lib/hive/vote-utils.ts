import { vote } from "./client-functions";
import { voteWithPrivateKey } from "./server-functions";
import { VoteOperation } from "@hiveio/dhive";
import { voting_value2 } from "@/components/PostCard/calculateHiveVotingValueForHiveUser";

export interface VoteParams {
    username: string;
    author: string;
    permlink: string;
    weight: number;
    userAccount?: any; // Optional user account object for value calculation
}

/**
 * Shared voting function that handles both keychain and privateKey voting methods
 * 
 * @param params - Vote parameters (username, author, permlink, weight, userAccount)
 * @returns Promise with vote result including calculated vote value
 */
export const processVote = async (params: VoteParams): Promise<{
    success: boolean;
    message?: string;
    voteType?: string;
    voteValue?: number;
}> => {
    const { username, author, permlink, weight, userAccount } = params;

    if (!username) {
        return { success: false, message: "Username is missing" };
    }

    // Check if we're on client side
    if (typeof window === "undefined") {
        return { success: false, message: "localStorage is not available on the server" };
    }

    const loginMethod = localStorage.getItem("LoginMethod");

    // Determine vote type from weight
    const voteType = weight > 0 ? "upvote" : weight < 0 ? "downvote" : "cancel";

    try {
        // Calculate vote value if user account is provided
        let voteValue = 0;
        if (userAccount && weight !== 0) {
            try {
                voteValue = await voting_value2(userAccount);
                console.log("Calculated vote value:", voteValue);
            } catch (error) {
                console.error("Error calculating vote value:", error);
            }
        }

        if (loginMethod === "keychain") {
            // Use keychain voting
            const response = await vote({
                username,
                permlink,
                author,
                weight,
            });

            return { ...response, voteType, voteValue };
        }
        else if (loginMethod === "privateKey") {
            // Use private key voting
            const voteOp: VoteOperation = [
                "vote",
                {
                    voter: username,
                    author,
                    permlink,
                    weight,
                },
            ];

            const encryptedPrivateKey = localStorage.getItem("EncPrivateKey");
            if (!encryptedPrivateKey) {
                return { success: false, message: "Private key not found in localStorage" };
            }

            await voteWithPrivateKey(encryptedPrivateKey, voteOp);
            // Return success with voteType and calculated value for consistency with keychain response
            return { success: true, voteType, voteValue };
        }
        else {
            return { success: false, message: "Login method not recognized" };
        }
    } catch (error) {
        console.error("Error during voting:", error);
        const errorMessage = (error as Error)?.message || "Unknown error occurred";
        return { success: false, message: errorMessage, voteType };
    }
};
