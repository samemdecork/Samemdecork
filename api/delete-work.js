
import crypto from "crypto";

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({
      message: "Method not allowed"
    });
  }


  try {

    const {
      password,
      public_id
    } = req.body || {};


    if (
      !password ||
      password !== process.env.ADMIN_PASSWORD
    ) {

      return res.status(401).json({
        message: "Unauthorized"
      });

    }


    if (!public_id) {

      return res.status(400).json({
        message: "public_id missing"
      });

    }


    /*
     * حماية إضافية:
     * الإدارة تقدر تحذف غير الصور
     * الموجودة داخل ch­taibi2026
     */

    if (!public_id.startsWith("chtaibi2026/")) {

      return res.status(403).json({
        message: "Invalid folder"
      });

    }


    const timestamp =
      Math.floor(Date.now() / 1000);


    const signatureString =
      `public_id=${public_id}&timestamp=${timestamp}`;


    const signature =
      crypto
        .createHash("sha1")
        .update(
          signatureString +
          process.env.CLOUDINARY_API_SECRET
        )
        .digest("hex");


    const form =
      new URLSearchParams();


    form.append(
      "public_id",
      public_id
    );

    form.append(
      "timestamp",
      String(timestamp)
    );

    form.append(
      "api_key",
      process.env.CLOUDINARY_API_KEY
    );

    form.append(
      "signature",
      signature
    );


    const response =
      await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/destroy`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/x-www-form-urlencoded"
          },
          body: form
        }
      );


    const data =
      await response.json();


    if (!response.ok) {

      console.error(data);

      return res.status(500).json({
        message: "Cloudinary delete failed"
      });

    }


    return res.status(200).json({
      ok: true,
      result: data.result
    });


  } catch (error) {

    console.error(error);

    return res.status(500).json({
      message: "Delete error"
    });

  }

}
