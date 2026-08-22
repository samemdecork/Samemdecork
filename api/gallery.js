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

    // الأقسام الموجودة في الموقع
    const folders = {
      works: "samemdecork/works",
      tapis: "samemdecork/tapis",
      products: "samemdecork/products"
    };

    const type = req.query.type || "works";

    // إذا القسم غير معروف نرجعو works
    const prefix = folders[type] || folders.works;

    const auth = Buffer
      .from(`${apiKey}:${apiSecret}`)
      .toString("base64");

    const url =
      `https://api.cloudinary.com/v1_1/${cloudName}` +
      `/resources/image/upload` +
      `?prefix=${encodeURIComponent(prefix)}` +
      `&max_results=500`;

    const response = await fetch(url, {
      method: "GET",
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

    // ترتيب الصور من الأحدث إلى الأقدم
    const resources = (data.resources || []).sort(
      (a, b) =>
        new Date(b.created_at) - new Date(a.created_at)
    );

    const images = resources.map((item, index) => {

      const publicId =
        item.public_id || "";

      const fileName =
        publicId
          .split("/")
          .pop()
          .replace(/\.[^/.]+$/, "")
          .replace(/[-_]/g, " ");

      return {
        id: item.asset_id || publicId,
        public_id: publicId,
        name: fileName,
        url: item.secure_url,
        width: item.width,
        height: item.height,
        format: item.format,
        created_at: item.created_at,

        // رقم الصورة داخل القسم
        number: index + 1
      };

    });

    return res.status(200).json({
      success: true,
      type: type,
      folder: prefix,
      count: images.length,
      images: images
    });

  } catch (error) {

    console.error("Gallery API Error:", error);

    return res.status(500).json({
      success: false,
      error: error.message || "Server error"
    });

  }
}
