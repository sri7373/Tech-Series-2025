const mindee = require("mindee");
const path = require("path");

const modelId = process.env.MODEL_ID;
const mindeeApiKey = process.env.MINDEE_API_KEY;

async function extractItems(filePath) {
  const mindeeClient = new mindee.ClientV2({ apiKey: mindeeApiKey });

  const inferenceParams = {
    modelId: modelId,
    rag: false
  };

  const inputSource = new mindee.PathInput({ inputPath: filePath });

  // Await the response
  const resp = await mindeeClient.enqueueAndGetInference(
    inputSource,
    inferenceParams
  );

  // Go directly to line items
  const lineItems =
    resp?.rawHttp?.inference?.result?.fields?.line_items?.items || [];

  const items = lineItems.map(item => ({
    description: (item.fields?.description?.value || "").replace(/\n/g, " "),
    quantity: item.fields?.quantity?.value || 1,
    unitPrice: item.fields?.unit_price?.value || 0,
    totalPrice: item.fields?.total_price?.value || 0
  }));

  return items;
}

module.exports = { extractItems };