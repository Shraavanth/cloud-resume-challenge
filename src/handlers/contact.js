import { PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { v4 as uuidv4 } from "uuid";
import { docClient } from "../utils/db.js";
import { sendResponse } from "../utils/response.js";
import { requireAdmin } from "../utils/auth.js";

const ses = new SESClient({ region: process.env.AWS_REGION || "us-east-1" });
const CONTACTS_TABLE = process.env.CONTACTS_TABLE || "Contacts";
const SENDER_EMAIL = process.env.VERIFIED_SENDER_EMAIL;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const handler = async (event) => {
  const method = event.httpMethod || event.requestContext?.http?.method || "POST";

  // 1. GET /contact (Admin only: View submitted contact messages)
  if (method === "GET") {
    const authError = requireAdmin(event);
    if (authError) {
      return sendResponse(405, { message: "Method Not Allowed" });
    }

    try {
      const result = await docClient.send(
        new ScanCommand({ TableName: CONTACTS_TABLE })
      );
      const items = (result.Items || []).sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      );
      return sendResponse(200, { contacts: items });
    } catch (error) {
      console.error("Contacts Fetch Error:", error);
      return sendResponse(500, {
        message: "Internal server error fetching contacts",
      });
    }
  }

  // 2. POST /contact (Public: Submit contact form)
  if (method === "POST") {
    let body;
    try {
      body = JSON.parse(event.body || "{}");
    } catch {
      return sendResponse(400, { message: "Invalid JSON in request body" });
    }

    const { name, email, message } = body;

    if (!name || !email || !message) {
      return sendResponse(400, {
        message: "name, email, and message are required fields",
      });
    }
    if (typeof name !== "string" || !name.trim() || typeof message !== "string" || !message.trim()) {
      return sendResponse(400, { message: "name, email, and message are required fields" });
    }
    if (typeof email !== "string" || !EMAIL_REGEX.test(email.trim())) {
      return sendResponse(400, { message: "Invalid email format" });
    }

    const contactItem = {
      contactId: uuidv4(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      message: message.trim(),
      createdAt: new Date().toISOString(),
    };

    try {
      // Save contact to DynamoDB
      await docClient.send(
        new PutCommand({
          TableName: CONTACTS_TABLE,
          Item: contactItem,
        })
      );

      // Attempt to send email via SES if verified email is configured
      let emailNotificationSent = false;
      if (SENDER_EMAIL && SENDER_EMAIL !== "admin@example.com") {
        try {
          await ses.send(
            new SendEmailCommand({
              Source: SENDER_EMAIL,
              Destination: { ToAddresses: [SENDER_EMAIL] },
              Message: {
                Subject: { Data: `New Portfolio Message from ${contactItem.name}` },
                Body: {
                  Text: {
                    Data: `Sender: ${contactItem.name}\nEmail: ${contactItem.email}\nDate: ${contactItem.createdAt}\n\nMessage:\n${contactItem.message}`,
                  },
                },
              },
            })
          );
          emailNotificationSent = true;
        } catch (sesErr) {
          console.warn("SES email delivery failed (unverified sender or sandbox limitation):", sesErr.message);
          // Saved to DynamoDB, so do not fail entire transaction
        }
      }

      return sendResponse(201, {
        message: "Message sent successfully!",
        contactId: contactItem.contactId,
        emailNotificationSent,
      });
    } catch (error) {
      console.error("Contact Submission Error:", error);
      return sendResponse(500, {
        message: "Internal server error saving contact message",
      });
    }
  }

  return sendResponse(405, { message: "Method Not Allowed" });
};