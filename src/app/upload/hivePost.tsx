// create a hive keychain sdk post function to be used in other components

// import keychain sdk 
import { KeychainSDK, KeychainKeyTypes, KeychainRequestTypes } from 'keychain-sdk';
import axios, { AxiosResponse } from 'axios';

// dummy interface for post details

interface PostDetails {
    post_id: number;
}

// dummy function to post a post

const Post = async (author: string, permlink: string): Promise<PostDetails | null> => {
    try {
        const response: AxiosResponse = await axios.post('https://api.hive.blog/', {
            jsonrpc: '2.0',
            method: 'condenser_api.get_content',
            params: [author, permlink],
            id: 1
        });
        if (response.data.result) {
            return response.data.result;
        }
    } catch (error) {
        console.error(error);
    }
    return null;
}
export default Post;
