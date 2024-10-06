import React from 'react';
import { Box, Spinner } from '@chakra-ui/react';
import useHiveAccount from '@/hooks/useHiveAccount';
import ProfileCard from '@/components/Profile/profileCard';

type ProfileLinkProps = {
    username: string;
};

const ProfileLink: React.FC<ProfileLinkProps> = ({ username }) => {
    const { hiveAccount, isLoading, error } = useHiveAccount(username);
    console.log(hiveAccount);
    if (isLoading) {
        return <Spinner size="sm" color="yellow" />;
    }

    if (error || !hiveAccount) {
        return <span>Error loading profile</span>;
    }

    return <ProfileCard user={hiveAccount} />;
};

export default ProfileLink;

