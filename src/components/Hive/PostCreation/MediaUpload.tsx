import { Box, Button, Input } from "@chakra-ui/react";
import React, { useRef } from "react";
import { FaImage } from "react-icons/fa";

interface MediaUploaderProps {
  onUpload: (files: File[]) => void;
  disabled?: boolean;
}

const MediaUploader: React.FC<MediaUploaderProps> = ({
  onUpload,
  disabled = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <Box>
      <Button
        _active={{ borderColor: "border" }}
        isDisabled={disabled}
        onClick={() => inputRef.current?.click()}
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
        accept="image/*,video/*"
        onChange={(event) => onUpload(Array.from(event.target.files || []))}
        hidden
      />
    </Box>
  );
};

export default MediaUploader;
