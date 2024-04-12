'use client'
import React from "react";
import { useHiveUser } from "@/contexts/UserContext";
import { Button } from "@chakra-ui/react";
const ProfileDashboard = () => {
    const user = useHiveUser();

    const hasVotedForSkatehive = user?.hiveUser?.witness_votes?.includes('skatehive');

    const handleVote = () => {
        // Add your transaction logic here
    }

    return (
        <div>
            <p>Welcome, {String(user?.hiveUser?.name)}</p>
            <p> Hive Power: {String(user?.hiveUser?.vesting_shares)}</p>
            <p> Witness: {String(user?.hiveUser?.witness_votes)}</p>
            {!hasVotedForSkatehive && <Button onClick={handleVote}>Vote for Skatehive</Button>}
        </div>
    )
}

export default ProfileDashboard;