/** Larger files are refused before decoding; phone photos are well below this. */
export const MAX_PHOTO_BYTES = 20 * 1024 * 1024;
const MAX_DECODED_PIXELS = 64_000_000;
const ALLOWED_RASTER_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "image/heic",
  "image/heif",
]);

/** Shrinks a picked raster image to a JPEG data URL so it fits in browser storage. */
export function readPhoto(file: File, max = 900): Promise<string> {
  return new Promise((resolve, reject) => {
    const type = file.type.toLowerCase();
    if (
      !ALLOWED_RASTER_TYPES.has(type) ||
      file.size <= 0 ||
      file.size > MAX_PHOTO_BYTES
    ) {
      reject(new Error("Not a usable image"));
      return;
    }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      try {
        if (
          !img.naturalWidth ||
          !img.naturalHeight ||
          img.naturalWidth * img.naturalHeight > MAX_DECODED_PIXELS
        ) {
          reject(new Error("Image size is not supported"));
          return;
        }
        const scale = Math.min(
          1,
          max / Math.max(img.naturalWidth, img.naturalHeight),
        );
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
        const context = canvas.getContext("2d");
        if (!context) {
          reject(new Error("Canvas unavailable"));
          return;
        }
        // JPEG has no transparency: without this, clear areas turn black.
        context.fillStyle = "white";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.8));
      } catch (error) {
        reject(error instanceof Error ? error : new Error("Could not process image"));
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Not an image"));
    };
    img.src = url;
  });
}
