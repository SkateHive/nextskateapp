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
        { name: "Vote on Skatehive Witness", xp: 50 },
        { name: "Add Ethereum Address", xp: 30 },
        { name: "More than 5 Posts", xp: 10 },
    ],
    3: [
        { name: "More than 50 HP", xp: 150 },
        { name: "Posted this week", xp: 10 },
        { name: "Make web gnar cry", xp: 350 },
        { name: "Fart in KnowHows Face", xp: 450 }
    ],
    4: [
        { name: "soon", xp: 150 },
        { name: "soon", xp: 250 },
        { name: "soon", xp: 350 },
        { name: "soon", xp: 450 },
    ],
    5: [
        { name: "soon", xp: 150 },
        { name: "soon", xp: 250 },
        { name: "soon", xp: 350 },
        { name: "soon", xp: 450 }
    ],
    6: [
        { name: "soon", xp: 150 },
        { name: "soon", xp: 250 },
        { name: "soon", xp: 350 },
        { name: "soon", xp: 450 }
    ],
    7: [
        { name: "soon", xp: 150 },
        { name: "soon", xp: 250 },
        { name: "soon", xp: 350 },
        { name: "soon", xp: 450 }
    ]
};


export const recurringTasks: { [key: number]: Mission[] } = {
    1: [
        { name: "Post on Feed", xp: 5 },
        { name: "Comment on 3 posts", xp: 250 },
    ]
};