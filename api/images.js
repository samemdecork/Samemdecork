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

    const auth = Buffer
      .from(`${apiKey}:${apiSecret}`)
      .toString("base64");

    const url =
      `https://api.cloudinary.com/v1_1/${cloudName}` +
      `/resources/image/upload?max_results=500`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Basic ${auth}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Cloudinary error:", data);

      return res.status(500).json({
        error: "Cloudinary request failed",
        details: data
      });
    }

    const resources = data.resources || [];

    // غير الصور ديال موقع صمم ديكورك
    const images = resources
      .filter((img) => {

        const publicId = img.public_id || "";
        const assetFolder = img.asset_folder || "";

        return (
          publicId.startsWith("samemdecork/") ||
          assetFolder === "samemdecork" ||
          assetFolder.startsWith("samemdecork/")
        );

      })
      .map((img) => {

        const publicId =
          img.public_id || "";

        const assetFolder =
          img.asset_folder || "";

        let category = "general";

        // نحاول نعرف القسم من المجلد
        if (assetFolder.includes("/")) {

          const parts =
            assetFolder.split("/");

          category =
            parts[parts.length - 1];

        } else if (
          publicId.startsWith("samemdecork/")
        ) {

          const parts =
            publicId.split("/");

          if (parts.length >= 3) {
            category = parts[1];
          }

        }

        return {
          url: img.secure_url,
          public_id: publicId,
          category: category,
          created_at: img.created_at,
          width: img.width,
          height: img.height
        };

      });

    return res.status(200).json({
      count: images.length,
      images: images
    });

  } catch (error) {

    console.error("API ERROR:", error);

    return res.status(500).json({
      error: "Failed to load images",
      details: error.message
    });

  }
}
