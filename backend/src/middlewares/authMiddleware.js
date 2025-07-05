import jwt from "jsonwebtoken";
import { configDotenv } from "dotenv";
configDotenv();

const authMiddleware = async (req, res, next) => {
    // console.log(req.cookies);
    const { token } = req.cookies;

    if (!token) {
        return res.status(401).json({
            msg: "no token provided!"
        })
    }

    try {
        const decode = await jwt.verify(token, process.env.JWT_SECRET_TOKEN);
        // console.log(decode);
        req.user = decode;
        next();

    } catch (err) {
        return res.status(401).json({
            msg: "invalid or expired token!"
        })
    }
}


export default authMiddleware;