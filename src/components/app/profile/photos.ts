/** Larger files are refused before decoding; phone photos are well below this. */
export const MAX_PHOTO_BYTES = 20 * 1024 * 1024;

/** Shrinks a picked image to a JPEG data URL so it fits in browser storage. */
export function readPhoto(file: File, max = 900): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/") || file.size > MAX_PHOTO_BYTES) {
      reject(new Error("Not a usable image"));
      return;
    }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      // An image without a size (some SVGs) would become an empty picture.
      if (!img.width || !img.height) {
        reject(new Error("Image has no size"));
        return;
      }
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const context = canvas.getContext("2d")!;
      // JPEG has no transparency: without this, clear areas turn black.
      context.fillStyle = "white";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.8));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Not an image"));
    };
    img.src = url;
  });
}
