"use client";

import type React from "react";

import { useState, useRef } from "react";
import Image from "next/image";
import { X, Upload, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageUploadProps {
  existingImages?: string[];
  onImagesChange: (newImages: File[], removedImageUrls: string[]) => void;
  maxImages?: number;
}

export function ImageUpload({
  existingImages = [],
  onImagesChange,
  maxImages = 5,
}: ImageUploadProps) {
  const [newImages, setNewImages] = useState<File[]>([]);
  const [removedImageUrls, setRemovedImageUrls] = useState<string[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const remainingExistingImages = existingImages.filter(
    (url) => !removedImageUrls.includes(url)
  );
  const totalImages = remainingExistingImages.length + newImages.length;
  const canAddMoreImages = totalImages < maxImages;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFilesArray: File[] = [];
    const newPreviewUrls: string[] = [];

    // Check if adding these files would exceed the maximum
    if (totalImages + files.length > maxImages) {
      alert(`You can only upload a maximum of ${maxImages} images.`);
      return;
    }

    // Process each file
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      newFilesArray.push(file);

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      newPreviewUrls.push(previewUrl);
    }

    setNewImages((prev) => [...prev, ...newFilesArray]);
    setPreviewUrls((prev) => [...prev, ...newPreviewUrls]);
    onImagesChange([...newImages, ...newFilesArray], removedImageUrls);

    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeNewImage = (index: number) => {
    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(previewUrls[index]);

    const updatedImages = newImages.filter((_, i) => i !== index);
    const updatedPreviewUrls = previewUrls.filter((_, i) => i !== index);

    setNewImages(updatedImages);
    setPreviewUrls(updatedPreviewUrls);
    onImagesChange(updatedImages, removedImageUrls);
  };

  const removeExistingImage = (url: string) => {
    setRemovedImageUrls((prev) => [...prev, url]);
    onImagesChange(newImages, [...removedImageUrls, url]);
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Existing images that haven't been removed */}
        {remainingExistingImages.map((url, index) => (
          <div
            key={`existing-${index}`}
            className="relative aspect-square rounded-md overflow-hidden border"
          >
            <Image
              src={url || "/placeholder.svg"}
              alt={`Property image ${index + 1}`}
              fill
              className="object-cover"
            />
            <button
              type="button"
              onClick={() => removeExistingImage(url)}
              className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-black/70"
              aria-label="Remove image"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}

        {/* New images with previews */}
        {previewUrls.map((url, index) => (
          <div
            key={`new-${index}`}
            className="relative aspect-square rounded-md overflow-hidden border"
          >
            <Image
              src={url || "/placeholder.svg"}
              alt={`New image ${index + 1}`}
              fill
              className="object-cover"
            />
            <button
              type="button"
              onClick={() => removeNewImage(index)}
              className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-black/70"
              aria-label="Remove image"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}

        {/* Add image button */}
        {canAddMoreImages && (
          <button
            type="button"
            onClick={triggerFileInput}
            className="aspect-square rounded-md border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-500 hover:text-gray-700 hover:border-gray-400 transition-colors"
          >
            <Plus className="h-8 w-8 mb-2" />
            <span className="text-sm">Add Image</span>
          </button>
        )}
      </div>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        multiple
        className="hidden"
      />

      {/* Upload button */}
      {canAddMoreImages && (
        <Button
          type="button"
          variant="outline"
          onClick={triggerFileInput}
          className="mt-2"
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload Images
        </Button>
      )}

      <p className="text-sm text-gray-500">
        {totalImages} of {maxImages} images used.{" "}
        {canAddMoreImages
          ? `You can add ${maxImages - totalImages} more.`
          : "Maximum images reached."}
      </p>
    </div>
  );
}
