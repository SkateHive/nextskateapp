import { Box, Input } from "@chakra-ui/react";
import React, { useRef } from "react";

interface ImageUploaderProps {
  onUpload: (files: File[]) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onUpload }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    onUpload(files);
  };

  const triggerFileInput = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  return (
    <Box onClick={triggerFileInput}>
      <Input
        ref={inputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleImageUpload}
        hidden
      />
    </Box>
  );
};

export default ImageUploader;
