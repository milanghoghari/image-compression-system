import config from "../../config.json";
import axios from "axios";

export async function sendWebhook(requestId, status) {
  // get webhook url from config
  const webhookUrl = config.webhookUrl;

  const webhookData = {
    requestId: requestId,
    status: status,
  };

  const response = await axios.post(webhookUrl, webhookData);

  if (response.status >= 400) {
    console.log("failed to send webhook");
  }

  console.log("webhook sent successfully");
}
