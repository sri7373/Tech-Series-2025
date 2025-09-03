const mindee = require("mindee");
const path = require("path");
const { Client, product } = require("mindee");

async function extractItems(filePath) {
  const client = new Client({ apiKey: process.env.MINDEE_API_KEY });
  console.log("Mindee client created, apiKey:", process.env.MINDEE_API_KEY);
  console.log("Parsing file:", filePath);
  const input = client.docFromPath(filePath);

  let apiResponse;
  try {
    console.log("Mindee client created, apiKey:", process.env.MINDEE_API_KEY);
    console.log("Parsing file:", filePath);
    apiResponse = await client.parse(product.ReceiptV5, input);
  } catch (err) {
    console.error("Mindee V5 failed, trying V4:", err);
    // apiResponse = await client.parse(product.ReceiptV4, input);
  }

  const doc = apiResponse?.document;
  if (!doc) {
    throw new Error("No document returned from Mindee API");
  }

  const pages = doc.inference?.pages || [];
  const items = [];

  for (const page of pages) {
    const lineItems = page.prediction?.lineItems || page.prediction?.line_items || [];
    for (const li of lineItems) {
      const description =
        li?.description?.value || li?.product?.value || li?.name?.value || "";
      const qty = li?.quantity?.value || li?.qty?.value || 1;
      if (description) {
        items.push({ description: description.trim(), quantity: Number(qty) || 1 });
      }
    }
  }

  return items;
}

// test
// async function extractItems(filePath) {
//   console.log("DEBUG OCR file path:", filePath);
//   // Simulate OCR result
//   return [
//     { description: "Milk", quantity: 2 },
//     { description: "Meiji Milk", quantity: 1 }
//   ];
// }

module.exports = { extractItems };

