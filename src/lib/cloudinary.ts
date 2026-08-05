import { v2 as cloudinary } from "cloudinary";
import { ENV } from "@/lib/env";

cloudinary.config({
  cloud_name: ENV.CLOUDINARY_CLOUD_NAME,
  api_key:    ENV.CLOUDINARY_API_KEY,
  api_secret: ENV.CLOUDINARY_API_SECRET,
  secure:     true,
});

type UploadOpts = {
  folder?: string;
  publicId?: string;
  transformation?: Record<string, unknown>[];
};

function buildUploadOpts(opts: UploadOpts) {
  const options: Record<string, unknown> = {
    folder: opts.folder ?? "tuskel/products",
    resource_type: "image",
  };
  if (opts.publicId) options["public_id"] = opts.publicId;
  if (opts.transformation) options["transformation"] = opts.transformation;
  return options;
}

/** Upload an image from a Buffer or base64 string. */
export async function uploadImage(source: Buffer | string, opts: UploadOpts = {}) {
  if (typeof source === "string") {
    return cloudinary.uploader.upload(source, buildUploadOpts(opts));
  }
  return new Promise<any>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(buildUploadOpts(opts), (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
    stream.end(source);
  });
}

/** Upload a buffer directly via upload_stream. */
export async function uploadBuffer(buffer: Buffer, opts: UploadOpts = {}) {
  return new Promise<any>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(buildUploadOpts(opts), (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
    stream.end(buffer);
  });
}

/** Delete an image by public_id or URL. */
export async function deleteImage(publicId: string) {
  return cloudinary.uploader.destroy(publicId);
}

export { cloudinary };
