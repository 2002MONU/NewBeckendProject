import jwt from "jsonwebtoken";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const verifyJWT = asyncHandler(async (req, __dirname, next) => {
    const token = req.cookies.accessToken || req.header(
        "Authorization"
    )?.replace("Bearer ", "");
    if (!token) {
        throw new ApiError(401, "Unauthorized");
    }
    try {

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decoded?._id).select("-password -refreshToken");
        
        req.user = user;
        next();
    } catch {
        throw new ApiError(401,errro?.message || "Unauthorized");
    }
});