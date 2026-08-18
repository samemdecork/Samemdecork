import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export default async function handler(req, res) {

  try {

    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      return res.status(500).json({
        error: "Cloudinary environment variables are missing"
      });
    }

    const result =
      await cloudinary.api.resources({
        type: "upload",
        prefix: "samemdecork/",
        resource_type: "image",
        max_results: 500
      });

    const images = (result.resources || []).map(img => {

      const parts = img.public_id.split("/");

      let category = "general";

      if (parts.length >= 2) {
        category = parts[1];
      }

      return {
        url: img.secure_url,
        public_id: img.public_id,
        category: category,
        created_at: img.created_at,
        width: img.width,
        height: img.height
      };

    });

    return res.status(200).json({
      images
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      error: "Failed to load images"
    });

  }

}
