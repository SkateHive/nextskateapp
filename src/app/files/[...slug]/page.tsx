'use client'
import { useEffect, useState } from 'react';
import { fetchIPFSFile } from "@/lib/pinata/server-functions";

interface PageProps {
    params: {
        slug: string[];
    };
}

const fetchAndRenderFile = async (cid: string): Promise<JSX.Element | null> => {
    const result = await fetchIPFSFile(cid);

    if (result) {
        const { base64String, fileType } = result;
        const byteCharacters = atob(base64String);
        const byteNumbers = new Array(byteCharacters.length).fill(0).map((_, i) => byteCharacters.charCodeAt(i));
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray]);
        console.log('Fetched file from IPFS:', blob);
        console.log('File type:', fileType);

        if (fileType.startsWith('image/')) {
            const imageUrl = URL.createObjectURL(blob);
            console.log('Image URL:', imageUrl);
            return <img src={imageUrl} alt="Fetched from IPFS" />;
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
    } else {
        console.log('CID is not pinned by your account.');
        return null;
    }
};

const Page = ({ params }: PageProps) => {
    const [fileElement, setFileElement] = useState<JSX.Element | null>(null);

    useEffect(() => {
        const cid = params.slug.join('/');

        fetchAndRenderFile(cid).then(element => {
            setFileElement(element);
        }).catch(error => {
            console.error('Error fetching and rendering file:', error);
            setFileElement(null); // Handle error state
        });
    }, [params.slug]);

    return (
        <div>
            <h1>Pinata CID Checker</h1>
            {fileElement || <p>File not found or not supported.</p>}
        </div>
    );
};

export default Page;
