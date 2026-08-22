
export default async function handler(req, res) {

  if (req.method !== "GET") {
    return res.status(405).json({
      message: "Method not allowed"
    });
  }

  try {

    const cloudName =
      process.env.CLOUDINARY_CLOUD_NAME;

    const apiKey =
      process.env.CLOUDINARY_API_KEY;

    const apiSecret =
      process.env.CLOUDINARY_API_SECRET;

    if (
      !cloudName ||
      !apiKey ||
      !apiSecret
    ) {
      return res.status(500).json({
        message: "Cloudinary environment variables missing"
      });
    }


    const url =
      `https://api.cloudinary.com/v1_1/${cloudName}/resources/image/upload` +
      `?prefix=chtaibi2026/` +
      `&max_results=500`;


    const auth =
      Buffer
        .from(`${apiKey}:${apiSecret}`)
        .toString("base64");


    const response =
      await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Basic ${auth}`
        }
      });


    if (!response.ok) {

      const text =
        await response.text();

      console.error(text);

      return res.status(500).json({
        message: "Cloudinary error"
      });

    }


    const data =
      await response.json();


    const resources =
      (data.resources || []).map(item => {

        const parts =
          item.public_id.split("/");

        const category =
          parts.length > 1
            ? parts[1]
            : "other";


        const filename =
          parts[parts.length - 1];


        return {

          image: item.secure_url,

          public_id:
            item.public_id,

          category:
            category,

          title:
            filename.replaceAll("_", " "),

          width:
            item.width,

          height:
            item.height,

          created_at:
            item.created_at

        };

      });


    resources.sort(
      (a, b) =>
        new Date(b.created_at) -
        new Date(a.created_at)
    );


    return res.status(200).json(
      resources
    );


  } catch (error) {

    console.error(error);

    return res.status(500).json({
      message: "Server error"
    });

  }

}
