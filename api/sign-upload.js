import crypto from "crypto";

export default async function handler(req, res) {

  if (req.method !== "GET") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return res.status(500).json({
        error: "Cloudinary environment variables missing"
      });
    }

    const type = req.query.type || "works";

    const folders = {
      works: "samemdecork/works",
      tapis: "samemdecork/tapis",
      products: "samemdecork/products"
    };

    const folder = folders[type] || folders.works;

    const timestamp = Math.floor(Date.now() / 1000);

    const signatureString =
      `folder=${folder}&timestamp=${timestamp}${apiSecret}`;

    const signature = crypto
      .createHash("sha1")
      .update(signatureString)
      .digest("hex");

    return res.status(200).json({
      cloudName,
      apiKey,
      timestamp,
      folder,
      signature
    });

  } catch (error) {

    return res.status(500).json({
      error: error.message
    });

  }
}
