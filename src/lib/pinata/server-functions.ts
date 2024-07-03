'use server'
import pinataSDK from '@pinata/sdk';

const NEXT_PUBLIC_PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY;
const NEXT_PUBLIC_PINATA_SECRET = process.env.NEXT_PUBLIC_PINATA_SECRET;
const NEXT_PUBLIC_PINATA_GATEWAY_TOKEN = process.env.NEXT_PUBLIC_PINATA_GATEWAY_TOKEN;

if (!NEXT_PUBLIC_PINATA_API_KEY || !NEXT_PUBLIC_PINATA_SECRET || !NEXT_PUBLIC_PINATA_GATEWAY_TOKEN) {
    throw new Error('Missing Pinata API key, secret, or gateway token');
}

const pinata = new pinataSDK(NEXT_PUBLIC_PINATA_API_KEY, NEXT_PUBLIC_PINATA_SECRET);

async function checkIfPinned(cid: string): Promise<boolean> {
    try {
        const result = await pinata.pinList({
            hashContains: cid,
        });

        return result.rows.some((pin: any) => pin.ipfs_pin_hash === cid);
    } catch (error) {
        console.error('Error checking if CID is pinned:', error);
        return false;
    }
}

export async function fetchIPFSFile(cid: string) {

    if (await checkIfPinned(cid)) {
        const privateGatewayUrl = `https://ipfs.skatehive.app/ipfs/${cid}?pinataGatewayToken=${NEXT_PUBLIC_PINATA_GATEWAY_TOKEN}`;

        try {
            const response = await fetch(privateGatewayUrl);

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const blob = await response.blob();
            console.log('Fetched file from IPFS:', blob);
            console.log('Blob size:', blob.size);
            console.log('Blob type:', blob.type);

            if (blob.size === 0) {
                throw new Error('Fetched blob has size 0');
            }

            const arrayBuffer = await blob.arrayBuffer();
            const base64String = Buffer.from(arrayBuffer).toString('base64');
            const fileType = blob.type;

            return { base64String, fileType };

        } catch (error) {
            console.error('Error fetching file from IPFS:', error);
            return null;
        }
    }
}