import fs from "fs";
import path from "path";
import crypto from "crypto";

/**
 * Uploads a base64 image string to either Cloudinary (if configured) or local disk.
 * Returns the public URL/path of the uploaded file.
 * 
 * @param {string} base64Str The base64 data URI (e.g. data:image/png;base64,...)
 * @returns {Promise<string|null>} The URL or relative path of the uploaded image, or null if empty.
 */
export async function uploadImage(base64Str) {
  if (!base64Str) return null;

  // If it's already a URL, return it
  if (
    base64Str.startsWith("http://") ||
    base64Str.startsWith("https://") ||
    base64Str.startsWith("/")
  ) {
    return base64Str;
  }

  // Cloudinary Upload Logic (optional production use)
  if (process.env.CLOUDINARY_URL) {
    try {
      // Lazy load cloudinary to avoid errors if the package is not installed
      const cloudinary = (await import("cloudinary")).v2;
      // Configure cloudinary using CLOUDINARY_URL env automatically
      const res = await cloudinary.uploader.upload(base64Str, {
        folder: "civicbridge",
      });
      return res.secure_url;
    } catch (err) {
      console.error("Cloudinary upload failed, falling back to local storage:", err);
    }
  }

  // Fallback: Local Disk Upload
  try {
    const matches = base64Str.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      throw new Error("Invalid base64 string format");
    }

    const mimeType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, "base64");

    // Determine extension from MIME type
    let extension = "png";
    if (mimeType.includes("jpeg") || mimeType.includes("jpg")) {
      extension = "jpg";
    } else if (mimeType.includes("webp")) {
      extension = "webp";
    } else if (mimeType.includes("gif")) {
      extension = "gif";
    }

    const filename = `${crypto.randomUUID()}.${extension}`;
    const publicDir = path.join(process.cwd(), "public");
    const uploadDir = path.join(publicDir, "uploads");

    // Ensure directories exist
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filepath = path.join(uploadDir, filename);
    await fs.promises.writeFile(filepath, buffer);

    return `/uploads/${filename}`;
  } catch (err) {
    console.error("Local file upload failed:", err);
    throw new Error("Failed to process image upload");
  }
}
