export interface Mission {
    name: string;
    xp: number;
}

export const dummyMissions: { [key: number]: Mission[] } = {
    1: [
        { name: "Add Profile Picture", xp: 30 },
        { name: "Complete Profile", xp: 60 },
        { name: "Make your first post", xp: 90 }
    ],
    2: [
        { name: "Vote on Skatehive Witness", xp: 150 },
        { name: "Add Ethereum Address", xp: 250 },
        { name: "More than 5 Posts", xp: 350 },
        { name: "Vote on SkateHive Proposal", xp: 450 }
    ],
    3: [
        { name: "Do a kickflip", xp: 150 },
        { name: "Sink Daryls Boat", xp: 250 },
        { name: "Make web gnar cry", xp: 350 },
        { name: "Fart in KnowHows Face", xp: 450 }
    ],
    4: [
        { name: "Vote on Skatehive Witness", xp: 150 },
        { name: "Add Ethereum Address", xp: 250 },
        { name: "More than 5 Posts", xp: 350 },
        { name: "Vote on SkateHive Proposal", xp: 450 }
    ],
    5: [
        { name: "Vote on Skatehive Witness", xp: 150 },
        { name: "Add Ethereum Address", xp: 250 },
        { name: "More than 5 Posts", xp: 350 },
        { name: "Vote on SkateHive Proposal", xp: 450 }
    ],
    6: [
        { name: "Vote on Skatehive Witness", xp: 150 },
        { name: "Add Ethereum Address", xp: 250 },
        { name: "More than 5 Posts", xp: 350 },
        { name: "Vote on SkateHive Proposal", xp: 450 }
    ],
    7: [
        { name: "Vote on Skatehisdve Witness", xp: 150 },
        { name: "Add Ethereum Address", xp: 250 },
        { name: "More than 5 Posts", xp: 350 },
        { name: "Vote on SkateHive Proposal", xp: 450 }
    ]
};


export const recurringTasks: { [key: number]: Mission[] } = {
    1: [
        { name: "Post on Feed", xp: 5 },
        { name: "Comment on 3 posts", xp: 250 },
    ]
};