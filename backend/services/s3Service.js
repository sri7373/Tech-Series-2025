const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const crypto = require("crypto");
const sharp = require("sharp"); // <-- add this

const dotenv = require('dotenv');

dotenv.config();

const s3 = new S3Client({
  region: process.env.BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
  },
});

function generateUniqueFileName(originalName) {
  const ext = originalName.substring(originalName.lastIndexOf('.')) || '';
  const unique = crypto.randomBytes(16).toString('hex');
  return `${unique}${ext}`;
}

async function uploadToS3(fileBuffer, originalName, mimeType) {
  const fileName = generateUniqueFileName(originalName);

  // Resize image to 500x500 (you can change size as needed)
  const resizedBuffer = await sharp(fileBuffer)
    .resize(1920, 1080, { fit: "inside" })
    .toBuffer();

  const command = new PutObjectCommand({
    Bucket: process.env.BUCKET_NAME,
    Key: fileName,
    Body: resizedBuffer,
    ContentType: mimeType,
  });
  await s3.send(command);
  return `https://${process.env.BUCKET_NAME}.s3.${process.env.BUCKET_REGION}.amazonaws.com/${fileName}`;
}

module.exports = { uploadToS3 };