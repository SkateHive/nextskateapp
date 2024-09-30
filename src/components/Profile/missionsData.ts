export interface Mission {
    name: string;
    xp: number;
    completed: string;
    imcompleted: string;
}

export const dummyMissions: { [key: number]: Mission[] } = {
    1: [
        { name: "Add Profile Picture", xp: 30, completed: "You Looks Good", imcompleted: "You look better with a profile pic" },
        { name: "Complete Profile", xp: 60, completed: "All set!", imcompleted: "Complete your profile, bro" },
        { name: "Make your first post", xp: 90, completed: "Youre Level 1!", imcompleted: "Introduce yourself to the OGs" },
    ],
    2: [
        { name: "Vote on Skatehive Witness", xp: 50, completed: "", imcompleted: ""},
        { name: "Add Ethereum Address", xp: 30, completed: "", imcompleted: "" },
        { name: "More than 5 Posts", xp: 10, completed: "", imcompleted: "" },
    ],
    3: [
        { name: "More than 50 HP", xp: 150, completed: "", imcompleted: "" },
        { name: "Posted this week", xp: 100, completed: "", imcompleted: "" },
        { name: "More than 100 Posts", xp: 150, completed: "", imcompleted: "" },
    ],
    4: [
        { name: "Follow our curation trail", xp: 150, completed: "", imcompleted: "" },
        { name: "More than 200 Posts", xp: 150, completed: "", imcompleted: "" },
        { name: "Savings HBD $100", xp: 350, completed: "", imcompleted: "" },
    ],
    5: [
        { name: "soon", xp: 250, completed: "", imcompleted: "" },
        { name: "soon", xp: 350, completed: "", imcompleted: "" },
        { name: "soon", xp: 450, completed: "", imcompleted: "" }
    ],
    6: [
        { name: "soon", xp: 250, completed: "", imcompleted: "" },
        { name: "soon", xp: 350, completed: "", imcompleted: "" },
        { name: "soon", xp: 450, completed: "", imcompleted: "" }
    ],
    7: [
        { name: "soon", xp: 250, completed: "", imcompleted: "" },
        { name: "soon", xp: 350, completed: "", imcompleted: "" },
        { name: "soon", xp: 450, completed: "", imcompleted: "" }
    ]
};


export const recurringTasks: { [key: number]: Mission[] } = {
    1: [
        { name: "Post on Feed", xp: 5, completed: "", imcompleted: "" },
        { name: "Comment on 3 posts", xp: 250, completed: "", imcompleted: "" },
    ]
};