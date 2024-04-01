export const extractImageUrls = (markdownText: string): string[] => {
    const regex = /!\[.*?\]\((.*?)\)/g;
    const imageUrls: string[] = [];
    let match = regex.exec(markdownText);
    while (match) {
        imageUrls.push(match[1]);
        match = regex.exec(markdownText);
    }
    return imageUrls;
};

