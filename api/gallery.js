export default async function handler(req, res) {
  try {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return res.status(500).json({
        success: false,
        error: "Cloudinary environment variables missing"
      });
    }

    const prefix = "samemdecork/works";

    const auth = Buffer
      .from(`${apiKey}:${apiSecret}`)
      .toString("base64");

    const url =
      `https://api.cloudinary.com/v1_1/${cloudName}` +
      `/resources/image/upload` +
      `?prefix=${encodeURIComponent(prefix)}` +
      `&max_results=500`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Basic ${auth}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        error: data.error?.message || "Cloudinary error"
      });
    }

    const images = (data.resources || [])
      .sort(
        (a, b) =>
          new Date(b.created_at) -
          new Date(a.created_at)
      )
      .map((item, index) => ({
        id: item.asset_id || item.public_id,
        public_id: item.public_id,
        name: item.public_id.split("/").pop(),
        url: item.secure_url,
        width: item.width,
        height: item.height,
        format: item.format,
        created_at: item.created_at,
        number: index + 1
      }));

    return res.status(200).json({
      success: true,
      folder: prefix,
      count: images.length,
      images
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      error: error.message || "Server error"
    });

  }
}
