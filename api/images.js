import { v2 as cloudinary } from "cloudinary";

export default async function handler(req, res) {
  try {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return res.status(500).json({
        error: "Cloudinary environment variables are missing"
      });
    }

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret
    });

    const result = await cloudinary.api.resources({
      resource_type: "image",
      type: "upload",
      prefix: "samemdecork/",
      max_results: 500
    });

    const images = (result.resources || []).map((img) => {
      const parts = img.public_id.split("/");

      return {
        url: img.secure_url,
        public_id: img.public_id,
        category: parts.length > 2 ? parts[1] : "general",
        created_at: img.created_at,
        width: img.width,
        height: img.height
      };
    });

    return res.status(200).json({
      images
    });

  } catch (error) {
    console.error("CLOUDINARY ERROR:", error);

    return res.status(500).json({
      error: "Failed to load images",
      details: error.message
    });
  }
}
