import crypto from "crypto";

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
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
        error:
        "Cloudinary environment variables are missing."
      });

    }


    const folder =
      req.body?.folder ||
      "samemdecork/works";


    const timestamp =
      Math.floor(
        Date.now() / 1000
      );


    const paramsToSign =
      `folder=${folder}&timestamp=${timestamp}`;


    const signature =
      crypto
      .createHash("sha1")
      .update(
        paramsToSign +
        apiSecret
      )
      .digest("hex");


    return res.status(200).json({

      signature,

      timestamp,

      api_key:
      apiKey,

      upload_url:
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`

    });


  } catch(error) {

    console.error(error);

    return res.status(500).json({
      error:"Server error"
    });

  }

}
