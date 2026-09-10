import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { v4 as uuidv4 } from "uuid";
import { docClient } from "../utils/db.js";
import { sendResponse } from "../utils/response.js";

const ses = new SESClient({ region: process.env.AWS_REGION || "us-east-1" });
const CONTACTS_TABLE = process.env.CONTACTS_TABLE || "Contacts";
const SENDER_EMAIL = process.env.VERIFIED_SENDER_EMAIL;

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return sendResponse(405, { message: "Method Not Allowed" });
  }

  try {
    const { name, email, message } = JSON.parse(event.body || "{}");

    if (!name || !email || !message) {
      return sendResponse(400, {
        message: "name, email, and message are required fields",
      });
    }

    const contactItem = {
      contactId: uuidv4(),
      name,
      email,
      message,
      createdAt: new Date().toISOString(),
    };

    // Save to DynamoDB
    await docClient.send(
      new PutCommand({
        TableName: CONTACTS_TABLE,
        Item: contactItem,
      })
    );

    // Send email using Amazon SES if verified email is configured
    if (SENDER_EMAIL) {
      await ses.send(
        new SendEmailCommand({
          Source: SENDER_EMAIL,
          Destination: { ToAddresses: [SENDER_EMAIL] },
          Message: {
            Subject: { Data: `New Portfolio Message from ${name}` },
            Body: {
              Text: {
                Data: `Sender: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
              },
            },
          },
        })
      );
    }

    return sendResponse(200, { message: "Message sent successfully!" });
  } catch (error) {
    console.error("Contact API Error:", error);
    return sendResponse(500, {
      message: "Internal server error",
      error: error.message,
    });
  }
};