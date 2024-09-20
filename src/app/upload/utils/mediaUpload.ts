"use client";

import crypto from "crypto";
import {
  APP_HIVE_USER,
  IPFS_BASE_URL,
  PINATA_API_KEY,
  PINATA_SECRET,
} from "@/lib/constants";
import { signImageHash } from "@/lib/hive/server-functions";

type uploadTo = "hive" | "ipfs";

/**
 * Upload multiple images to Hive Images
 * @param images Images to upload
 * @param setUploadProgress Function to update upload progress state
 * @returns
 */
export async function uploadImages(images: File[], uploadTo: uploadTo) {
  const uploadedImages = await Promise.all(
    images.map(async (image) => {
      const isVideo = image.type.startsWith("video/");

      try {
        const uploadUrl =
          uploadTo == "ipfs" || isVideo
            ? await uploadFileToIPFS(image)
            : await uploadImageToHive(image);

        if (isVideo) {
          return `<iframe src="${uploadUrl}" allowfullscreen></iframe>`;
        } else {
          return `![Image](${uploadUrl})`;
        }
      } catch (error) {
        console.error("Error uploading image:", error);
        return null;
      }
    })
  );

  const validUrls = uploadedImages.filter((image) => image !== null);
  return validUrls.length > 0 ? validUrls : [""];
}

/**
 * Upload a file to IPFS
 * @param file File to upload
 * @returns Request response data
 */
export const uploadFileToIPFS = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const uploadUrl = "https://api.pinata.cloud/pinning/pinFileToIPFS";
  try {
    const response = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        pinata_api_key: PINATA_API_KEY!,
        pinata_secret_api_key: PINATA_SECRET!,
      },
      body: formData,
    });

    if (response.ok) {
      const data = await response.json();
      return IPFS_BASE_URL + data.IpfsHash;
    } else {
      console.error(
        "Error uploading file to Pinata IPFS:",
        await response.text()
      );
    }
  } catch (error) {
    console.error("Error uploading file:", error);
  }
};

/**
 * Upload a image to Hive Images
 * @param file File to upload
 * @returns
 */
export async function uploadImageToHive(file: File): Promise<string> {
  const signatureUser = APP_HIVE_USER;

  const formData = new FormData();
  formData.append("file", file, file.name);

  const signature = await getFileSignature(file);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(
      "POST",
      "https://images.hive.blog/" + signatureUser + "/" + signature,
      true
    );

    xhr.onload = () => {
      if (xhr.status === 200) {
        const response = JSON.parse(xhr.responseText);
        resolve(response.url);
      } else {
        reject(new Error("Failed to upload image"));
      }
    };

    xhr.onerror = () => {
      reject(new Error("Failed to upload image"));
    };

    xhr.send(formData);
  });
}

/**
 * Generate a crypto signatura for a image
 * @param file File to get signatura
 * @returns File signatura
 */
export function getFileSignature(file: File): Promise<string> {
  return new Promise<string>(async (resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async () => {
      if (reader.result) {
        const content = Buffer.from(reader.result as ArrayBuffer);
        const hash = crypto
          .createHash("sha256")
          .update("ImageSigningChallenge")
          .update(content)
          .digest("hex");
        try {
          const signature = await signImageHash(hash);
          resolve(signature);
        } catch (error) {
          console.error("Error signing the hash:", error);
          reject(error);
        }
      } else {
        reject(new Error("Failed to read file."));
      }
    };
    reader.onerror = () => {
      reject(new Error("Error reading file."));
    };
    reader.readAsArrayBuffer(file);
  });
}
