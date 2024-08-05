import jwt from "jsonwebtoken";

export class JwtToken {
  async generateToken<T>(payload: T) {
    return jwt.sign(
      {
        payload,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    );
  }
}
