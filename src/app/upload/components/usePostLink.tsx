import { HiveAccount } from '@/lib/useHiveAuth';
import { useEffect, useState } from 'react';
import generatePermlink from '../utils/generatePermlink';


const usePostLink = (title: string, user: HiveAccount) => {
    const [postLink, setPostLink] = useState("");

    useEffect(() => {
        const buildPostLink = () => {
            const username = user?.name;
            if (username) {
                const permlink = generatePermlink(title);
                const link = `https://legacy.skatehive.app/post/hive-173115/@${username}/${permlink}`;
                setPostLink(link);
            }
        };
        buildPostLink();
    }, [title, user]);

    return postLink;
};

export default usePostLink;
