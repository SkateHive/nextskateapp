import { Box, Button, Input } from "@chakra-ui/react";
import React, { useRef } from "react";
import { FaImage } from "react-icons/fa";

interface ImageUploaderProps {
  onUpload: (files: File[]) => void;
  disabled?: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  onUpload,
  disabled = false,
}) => {
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
    <Box>
      <Button
        _active={{ borderColor: "border" }}
        // variant="ghost"
        isDisabled={disabled}
        onClick={triggerFileInput}
        color="#ABE4B8"
        variant="ghost"
        ml="auto"
        _hover={{
          color: "limegreen",
          textShadow: "0 0 10px 0 limegreen",
          transition: "all 0.2s",
        }}
      >
        <FaImage
          style={{
            color: "#ABE4B8",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.color = "limegreen";
            e.currentTarget.style.textShadow = "0 0 10px 0 limegreen";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.color = "#ABE4B8";
            e.currentTarget.style.textShadow = "none";
          }}
        />
      </Button>
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
