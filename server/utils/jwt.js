import jwt from 'jsonwebtoken';

// Use consistent secret with fallback
const SECRET = process.env.JWT_SECRET || 'your-fallback-secret';

const createJWT = (res, userId) => {
  const token = jwt.sign({ userId }, SECRET, {
    expiresIn: "30d",
  });

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", 
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  return token; // Return the token for use in redirects
};

// Export SECRET for token verification
export { SECRET };

export default createJWT;
