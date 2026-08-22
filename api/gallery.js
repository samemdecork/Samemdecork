export default async function handler(req, res) {
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

    const prefix = folders[type] || folders.works;

    const auth = Buffer
      .from(`${apiKey}:${apiSecret}`)
      .toString("base64");

    const url =
      `https://api.cloudinary.com/v1_1/${cloudName}` +
      `/resources/image/upload` +
      `?prefix=${encodeURIComponent(prefix)}` +
      `&max_results=100`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Basic ${auth}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    const images = (data.resources || []).map(item => ({
      public_id: item.public_id,
      url: item.secure_url,
      width: item.width,
      height: item.height,
      created_at: item.created_at
    }));

    res.status(200).json({
      success: true,
      type,
      images
    });

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
}
