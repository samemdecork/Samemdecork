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

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/resources/search`,
      {
        method: "POST",
        headers: {
          "Authorization": `Basic ${auth}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          expression: "resource_type:image AND type:upload",
          sort_by: [
            {
              created_at: "desc"
            }
          ],
          max_results: 100
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    const images = (data.resources || []).map(image => ({
      url: image.secure_url,
      public_id: image.public_id,
      created_at: image.created_at,
      width: image.width,
      height: image.height
    }));

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
