import crypto from "crypto";

export default async function handler(req, res) {

  if (req.method !== "GET") {

    return res.status(405).json({
      error:"Method not allowed"
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


    const category =
      req.query.category ||
      "works";


    const prefix =
      `samemdecork/${category}`;


    const timestamp =
      Math.floor(
        Date.now() / 1000
      );


    const params =
      `max_results=100&prefix=${prefix}&timestamp=${timestamp}`;


    const signature =
      crypto
      .createHash("sha1")
      .update(
        params +
        apiSecret
      )
      .digest("hex");


    const url =
      "https://api.cloudinary.com/v1_1/" +
      cloudName +
      "/resources/image/upload?" +
      new URLSearchParams({

        prefix,

        max_results:"100",

        timestamp:String(timestamp),

        api_key:apiKey,

        signature

      }).toString();


    const response =
      await fetch(url);


    const data =
      await response.json();


    if(!response.ok){

      return res.status(
        response.status
      ).json(data);

    }


    return res.status(200).json(
      data
    );


  } catch(error) {

    console.error(error);

    return res.status(500).json({
      error:"Server error"
    });

  }

}
