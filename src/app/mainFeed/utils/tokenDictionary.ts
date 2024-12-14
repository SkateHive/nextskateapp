import { TokenInfo } from "./types";
import { memberABI } from "@/lib/abi/memberABI";
import { nogsABI } from "@/lib/abi/nogsABI";
import { SenditABI } from "@/lib/abi/senditABI";

export const tokenDictionary: { [key: string]: TokenInfo } = {
    SENDIT: {
        address: '0xBa5B9B2D2d06a9021EB3190ea5Fb0e02160839A4',
        abi: SenditABI as unknown as any[],
        tokenLogo: "/logos/sendit.jpg"
    },
    NOGS: {
        address: '0x13741C5dF9aB03E7Aa9Fb3Bf1f714551dD5A5F8a',
        abi: nogsABI as unknown as any[],
        tokenLogo: "/logos/nog.png"
    },
    MEMBER: {
        address: '0x7d89e05c0b93b24b5cb23a073e60d008fed1acf9',
        abi: memberABI as unknown as any[],
        tokenLogo: "https://member.clinic/images/01-1.jpg"
    },
    DEGEN: {
        address: '0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed',
        abi: memberABI as unknown as any[],
        tokenLogo: "/logos/degen.png"
    },
    SPACE: {
        address: '0x48c6740bcf807d6c47c864faeea15ed4da3910ab',
        abi: memberABI as unknown as any[],
        tokenLogo: "https://cdn.zerion.io/8c5eea78-246d-4fe2-9ab6-5bcd75ef0fb7.png"
    },
    USDC: {
        address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
        abi: memberABI as unknown as any[],
        tokenLogo: "https://cdn.zerion.io/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.png"
    },
    HIVE: {
        address: '0xFUCKTHEGOVERMENT',
        abi: [],
        tokenLogo: "/logos/hiveLogo.png"
    },
    HBD: {
        address: '0xHBDFUCKTHEGOVERMENT',
        abi: [],
        tokenLogo: "/logos/hbd.svg"
    }

};