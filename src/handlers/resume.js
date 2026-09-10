import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { sendResponse } from "../utils/response.js";

const s3 = new S3Client({ region: process.env.AWS_REGION || "us-east-1" });
const RESUME_BUCKET = process.env.RESUME_BUCKET_NAME;
const RESUME_KEY = process.env.RESUME_FILE_NAME || "resume.pdf";

export const handler = async (event) => {
  try {
    const command = new GetObjectCommand({
      Bucket: RESUME_BUCKET,
      Key: RESUME_KEY,
    });

    // Generate URL valid for 5 minutes (300 seconds)
    const downloadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });

    return sendResponse(200, { downloadUrl });
  } catch (error) {
    console.error("Resume URL Error:", error);
    return sendResponse(500, { message: "Failed to generate download URL", error: error.message });
  }
};