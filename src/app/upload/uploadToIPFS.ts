type UploadResponse = {
    success: boolean;
    message: string;
    url?: string;
};

const PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY;
const PINATA_SECRET = process.env.NEXT_PUBLIC_PINATA_SECRET;

export const uploadFileToIPFS = async (file: File): Promise<UploadResponse> => {
    if (!PINATA_API_KEY || !PINATA_SECRET) {
        return {
            success: false,
            message: "Pinata API key or secret is not set.",
        };
    }

    const formData = new FormData();
    formData.append("file", file);
    const url = "https://api.pinata.cloud/pinning/pinFileToIPFS";

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "pinata_api_key": PINATA_API_KEY,
                "pinata_secret_api_key": PINATA_SECRET,
            },
            body: formData,
        });

        if (!response.ok) {
            throw new Error("Failed to upload to IPFS.");
        }

        const data = await response.json();
        const ipfsUrl = `https://ipfs.skatehive.app/ipfs/${data.IpfsHash}?pinataGatewayToken=${process.env.NEXT_PUBLIC_PINATA_GATEWAY_TOKEN}`;

        return {
            success: true,
            message: "File uploaded successfully.",
            url: ipfsUrl,
        };
    } catch (error) {
        console.error("Error uploading file to IPFS:", error);
        return {
            success: false,
            message: error instanceof Error ? error.message : "An unknown error occurred.",
        };
    }
};
