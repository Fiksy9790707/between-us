"use client";

const MAX_IMAGE_SIZE = 1600;
const JPEG_QUALITY = 0.82;

export async function compressImageFile(file: File) {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) {
    return file;
  }

  try {
    const image = await loadImage(file);
    const scale = Math.min(1, MAX_IMAGE_SIZE / Math.max(image.width, image.height));

    if (scale === 1 && file.size < 900_000) {
      URL.revokeObjectURL(image.src);
      return file;
    }

    const width = Math.max(1, Math.round(image.width * scale));
    const height = Math.max(1, Math.round(image.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    if (!context) {
      URL.revokeObjectURL(image.src);
      return file;
    }

    context.fillStyle = "#fff";
    context.fillRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);
    URL.revokeObjectURL(image.src);

    const blob = await canvasToBlob(canvas);
    if (!blob || blob.size >= file.size) {
      return file;
    }

    const baseName = file.name.replace(/\.[^.]+$/, "") || "image";
    return new File([blob], `${baseName}.jpg`, {
      type: "image/jpeg",
      lastModified: Date.now()
    });
  } catch {
    return file;
  }
}

function loadImage(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Image failed to load."));
    };
    image.src = url;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY);
  });
}
