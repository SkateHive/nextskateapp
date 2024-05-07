'use client'
import React from "react";
import { useHiveUser } from "@/contexts/UserContext";
import { Button } from "@chakra-ui/react";
const ProfileDashboard = () => {
    const user = useHiveUser();

    //const hasVotedForSkatehive = user?.hiveUser?.witness_votes?.includes('skatehive');

    const handleVote = () => {
        // Add your transaction logic here
    }

    return (
        <div>
        </div>
    )
}

export default ProfileDashboard;