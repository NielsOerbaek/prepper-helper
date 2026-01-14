import * as Minio from "minio";

const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || "localhost",
  port: parseInt(process.env.MINIO_PORT || "9000"),
  useSSL: process.env.MINIO_USE_SSL === "true",
  accessKey: process.env.MINIO_ACCESS_KEY || "",
  secretKey: process.env.MINIO_SECRET_KEY || "",
});

const BUCKET_NAME = process.env.MINIO_BUCKET || "photos";

export async function ensureBucket(): Promise<void> {
  // Skip bucket creation for cloud providers like R2 (create via dashboard)
  if (process.env.MINIO_SKIP_BUCKET_CREATION === "true") {
    return;
  }

  const exists = await minioClient.bucketExists(BUCKET_NAME);
  if (!exists) {
    await minioClient.makeBucket(BUCKET_NAME);
    // Set bucket policy to allow public read for photos
    // Note: R2 doesn't support this - configure public access in dashboard
    try {
      const policy = {
        Version: "2012-10-17",
        Statement: [
          {
            Effect: "Allow",
            Principal: { AWS: ["*"] },
            Action: ["s3:GetObject"],
            Resource: [`arn:aws:s3:::${BUCKET_NAME}/*`],
          },
        ],
      };
      await minioClient.setBucketPolicy(BUCKET_NAME, JSON.stringify(policy));
    } catch {
      // Policy setting not supported (e.g., Cloudflare R2)
      console.warn("Could not set bucket policy - configure public access manually");
    }
  }
}

export async function getPresignedUploadUrl(
  key: string,
  contentType: string,
  expiresIn: number = 3600
): Promise<string> {
  await ensureBucket();

  return await minioClient.presignedPutObject(BUCKET_NAME, key, expiresIn);
}

export async function getPresignedDownloadUrl(
  key: string,
  expiresIn: number = 3600
): Promise<string> {
  return await minioClient.presignedGetObject(BUCKET_NAME, key, expiresIn);
}

export async function deleteObject(key: string): Promise<void> {
  await minioClient.removeObject(BUCKET_NAME, key);
}

export async function getObjectUrl(key: string): Promise<string> {
  const publicUrl = process.env.MINIO_PUBLIC_URL;
  if (publicUrl) {
    return `${publicUrl}/${BUCKET_NAME}/${key}`;
  }
  // Fallback to presigned URL
  return await getPresignedDownloadUrl(key);
}

export { minioClient, BUCKET_NAME };
