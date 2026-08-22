
export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({
      ok: false,
      message: "Method not allowed"
    });
  }

  try {

    const { password } = req.body || {};

    const correctPassword =
      process.env.ADMIN_PASSWORD;

    if (!correctPassword) {
      return res.status(500).json({
        ok: false,
        message: "ADMIN_PASSWORD غير موجود في Vercel"
      });
    }

    if (
      !password ||
      password !== correctPassword
    ) {
      return res.status(401).json({
        ok: false
      });
    }

    return res.status(200).json({
      ok: true
    });

  } catch (error) {

    return res.status(500).json({
      ok: false
    });

  }
}
