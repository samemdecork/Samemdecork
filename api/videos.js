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

    const folder = "samemdecork/works-videos";

    const auth = Buffer
      .from(`${apiKey}:${apiSecret}`)
      .toString("base64");

    const url =
      `https://api.cloudinary.com/v1_1/${cloudName}` +
      `/resources/video/upload` +
      `?prefix=${encodeURIComponent(folder)}` +
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

    const videos = (data.resources || [])
      .sort(
        (a, b) =>
          new Date(b.created_at) -
          new Date(a.created_at)
      )
      .map((item) => ({
        id: item.asset_id || item.public_id,
        public_id: item.public_id,
        url: item.secure_url,
        width: item.width,
        height: item.height,
        format: item.format,
        created_at: item.created_at
      }));

    return res.status(200).json({
      success: true,
      folder,
      count: videos.length,
      videos
    });

  } catch (error) {

    console.error("Videos Error:", error);

    return res.status(500).json({
      success: false,
      error: error.message || "Server error"
    });
  }
}
