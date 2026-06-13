import { v2 as cloudinary } from "cloudinary";

let cloudinaryConfigured = false;

const configureOnce = (): void => {
  if (cloudinaryConfigured) {
    return;
  }
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary: faltan CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY o CLOUDINARY_API_SECRET");
  }
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
  cloudinaryConfigured = true;
};

/**
 * Credenciales presentes para subir binarios sin depender del Map en memoria.
 */
export const isCloudinaryConfigured = (): boolean => {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME?.trim() &&
      process.env.CLOUDINARY_API_KEY?.trim() &&
      process.env.CLOUDINARY_API_SECRET?.trim()
  );
};

/**
 * Sube un buffer a Cloudinary y devuelve la URL HTTPS estable (secure_url).
 */
export const uploadBufferToCloudinary = async (
  buffer: Buffer,
  contentType: string,
  folder = "whatsapp-reminders/inbound"
): Promise<string> => {
  configureOnce();

  const mainType =
    contentType.split(";")[0]?.trim()?.toLowerCase() || "image/jpeg";
  const resourceType =
    mainType.startsWith("image") || mainType.includes("webp")
      ? "image"
      : "auto";

  return await new Promise((resolve, reject) => {
    const upload = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
        use_filename: false,
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }
        const url = result?.secure_url;
        if (!url) {
          reject(new Error("Cloudinary: respuesta sin secure_url"));
          return;
        }
        resolve(url);
      }
    );
    upload.end(buffer);
  });
};
