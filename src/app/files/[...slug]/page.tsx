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

//?pinataGatewayToken=${NEXT_PUBLIC_PINATA_GATEWAY_TOKEN}
async function fetchAndRenderFile(cid: string): Promise<JSX.Element | null> {
    if (await checkIfPinned(cid)) {
        const privateGatewayUrl = `https://ipfs.skatehive.app/ipfs/${cid}`;
        try {
            const response = await fetch(privateGatewayUrl, {
                headers: {
                    Authorization: `Bearer your-private-gateway-token`
                }
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const blob = await response.blob();
            console.log('Fetched file from IPFS:', blob);
            const fileType = blob.type;
            console.log('File type:', fileType);
            if (fileType.startsWith('image/')) {
                return <img src={URL.createObjectURL(blob)} alt="Fetched from IPFS" />;
            } else if (fileType.startsWith('video/')) {
                return (
                    <video controls>
                        <source src={URL.createObjectURL(blob)} type={fileType} />
                        Your browser does not support the video tag.
                    </video>
                );
            } else {
                console.log('File is neither an image nor a video.');
                return null;
            }
        } catch (error) {
            console.error('Error fetching file from IPFS:', error);
            return null;
        }
    } else {
        console.log('CID is not pinned by your account.');
        return null;
    }
}

interface PageProps {
    params: {
        slug: string[];
    };
}

const Page = async ({ params }: PageProps) => {
    const cid = params.slug.join('/');
    const fileElement = await fetchAndRenderFile(cid);

    return (
        <div>
            <h1>Pinata CID Checker</h1>
            {fileElement || <p>File not found or not supported.</p>}
        </div>
    );
};

export default Page;
