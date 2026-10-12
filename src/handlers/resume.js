import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { sendResponse } from "../utils/response.js";
import { requireAdmin } from "../utils/auth.js";

const s3 = new S3Client({ region: process.env.AWS_REGION || "us-east-1" });

export const handler = async (event) => {
  const method = event.httpMethod || event.requestContext?.http?.method || "GET";
  const path = event.rawPath || event.path || event.requestContext?.http?.path || "";
  const resumeBucket = process.env.RESUME_BUCKET || process.env.RESUME_BUCKET_NAME;
  const resumeKey = process.env.RESUME_FILE_NAME || "resume.pdf";

  if (!resumeBucket) {
    return sendResponse(500, {
      message: "Server configuration error: RESUME_BUCKET is not configured",
    });
  }

  try {
    // 1. GET: Generate secure presigned download URL
    if (method === "GET") {
      const command = new GetObjectCommand({
        Bucket: resumeBucket,
        Key: resumeKey,
      });

      // Generate secure URL valid for 5 minutes (300 seconds)
      const downloadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });
      return sendResponse(200, { downloadUrl, expiresIn: 300 });
    }

    // 2. POST /resume/upload: Generate secure presigned upload URL (Admin only)
    if (method === "POST") {
      const authError = requireAdmin(event);
      if (authError) return authError;

      const command = new PutObjectCommand({
        Bucket: resumeBucket,
        Key: resumeKey,
        ContentType: "application/pdf",
      });

      const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });
      return sendResponse(200, {
        uploadUrl,
        key: resumeKey,
        expiresIn: 300,
        message: "Presigned upload URL generated successfully",
      });
    }

    return sendResponse(405, { message: "Method Not Allowed" });
  } catch (error) {
    console.error("Resume URL Error:", error);
    return sendResponse(500, {
      message: "Failed to generate resume URL",
    });
  }
};