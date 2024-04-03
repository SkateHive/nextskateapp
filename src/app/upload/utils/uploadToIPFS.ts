type UploadResponse = {
    success: boolean;
    message: string;
    url?: string;
};

const PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY;
const PINATA_SECRET = process.env.NEXT_PUBLIC_PINATA_SECRET;

export const uploadFileToIPFS = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const uploadUrl = "https://api.pinata.cloud/pinning/pinFileToIPFS";
    try {
        const response = await fetch(uploadUrl, {
            method: "POST",
            headers: {
                "pinata_api_key": PINATA_API_KEY!,
                "pinata_secret_api_key": PINATA_SECRET!,
            },
            body: formData,
        });

        if (response.ok) {
            const data = await response.json();
            return data;
        } else {
            console.error("Error uploading file to Pinata IPFS:", await response.text());
        }
    } catch (error) {
        console.error("Error uploading file:", error);
    }
};
