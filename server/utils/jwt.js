import jwt from "jsonwebtoken";

const createJWT = (res, userId) => {
  const token = jwt.sign({ userId: userId }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // only send cookie over https in production
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax", // More permissive in development
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });

  return token; // Return the token for use in redirects
};

export default createJWT;
