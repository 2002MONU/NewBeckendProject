import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import User from '../models/user.models.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import jwt from 'jsonwebtoken';

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new ApiError(404, 'User not found');
        }
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        await user.save({ validateBeforeSave: false });
        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, 'Something went wrong');
    }
};

const registerUser = asyncHandler(async (req, res) => {
    const { fullName, email, password, username } = req.body;

    if (
        !fullName || fullName.trim() === '' ||
        !email || email.trim() === '' ||
        !password || password.trim() === '' ||
        !username || username.trim() === ''
    ) {
        throw new ApiError(400, 'All fields are required');
    }
    const existingUser = await User.findOne({
        $or: [
            { email: email.trim() },
            { username: username.trim() }
        ]
    });

    if (existingUser) {
        throw new ApiError(400, 'User with this email or username already exists');
    }

    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

    if (!avatarLocalPath || !coverImageLocalPath) {
        throw new ApiError(400, 'Avatar and cover image are required');
    }

    let avatar = null;
    try {
        avatar = await uploadOnCloudinary(avatarLocalPath);
        console.log('Avatar uploaded successfully:', avatar);
    } catch (error) {
        console.log('Error uploading avatar:', error);
        throw new ApiError(500, 'Error uploading avatar');
    }

    let coverImage = null;
    try {
        coverImage = await uploadOnCloudinary(coverImageLocalPath);
        console.log('Cover image uploaded successfully:', coverImage);
    } catch (error) {
        console.log('Error uploading cover image:', error);
        throw new ApiError(500, 'Error uploading cover image');
    }

    const user = await User.create({
        fullName,
        email,
        password,
        username: username.toLowerCase(),
        avatar: avatar.url,
        coverImage: coverImage?.url
    });

    const createUser = await User.findById(user._id).select('-password -refreshToken');

    if (!createUser) {
        throw new ApiError(404, 'User not found');
    }
    res.status(201).json({
        status: 201,
        message: 'User created successfully',
        data: { user: createUser }
    });
});

const loginUser = asyncHandler(async (req, res) => {
    const { email, username, password } = req.body;

    if (!email && !username) {
        throw new ApiError(400, 'Email or username is required');
    }
    if (!password) {
        throw new ApiError(400, 'Password is required');
    }

    const user = await User.findOne({
        $or: [
            { email: email },
            { username: username }
        ]
    });

    if (!user) {
        throw new ApiError(401, 'Invalid email or username');
    }

    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(401, 'Invalid password');
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    const userWithoutPassword = await User.findById(user._id).select('-password -refreshToken');

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
    };

    return res.status(200).cookie('accessToken', accessToken, options)
        .json({
            status: 200,
            message: 'Login successful',
            data: { user: userWithoutPassword, accessToken, refreshToken }
        });
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken;
    req.body.refreshToken = incomingRefreshToken;
    if (!incomingRefreshToken) {
        throw new ApiError(401, 'Unauthorized');
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );
        const user = await User.findById(decodedToken?._id);
        if (!user) {
            throw new ApiError(401, 'Unauthorized');
        }

        if (user?.refreshToken !== incomingRefreshToken) {
            throw new ApiError(401, 'Unauthorized');
        }

        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
        };
        const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshToken(user._id);

        return res.status(200).cookie('accessToken', accessToken, options)
            .json(new ApiResponse(200, { accessToken, refreshToken: newRefreshToken }, 'Access token refreshed'));
    }
    catch (error) {
        throw new ApiError(401, 'Unauthorized');
    }
});

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user?._id, { $set: { refreshToken: null } }, { new: true });
    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
    };
    return res
        .status(200)
        .clearCookie('accessToken', options)
        .clearCookie('refreshToken', options)
        .json({
            status: 200,
            message: 'Logout successful',
        });
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user?._id);

    const isPasswordValid = await user.isPasswordCorrect(oldPassword);
    if (!isPasswordValid) {
        throw new ApiError(401, "Old password was incorrect");
    }

    user.password = newPassword;
    await user.save();
    res.status(200).json(new ApiResponse(200, {}, "Password changed Successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
    return res.status(200).json(new ApiResponse(200, req.user, "Current User Details"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullName, email } = req.body;

    if (!fullName || !email) {
        throw new ApiError(400, 'Full name and email are required');
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        { $set: { fullName, email } },
        { new: true }
    ).select("-password -refreshToken");

    res.status(200).json(new ApiResponse(200, user, "Account details updated successfully"));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, 'File is required');
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if (!avatar.url) {
        throw new ApiError(500, 'Something went wrong');
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        { $set: { avatar: avatar.url } },
        { new: true }
    ).select("-password -refreshToken");

    res.status(200).json(new ApiResponse(200, user, "Avatar updated successfully"));
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.file?.path;

    if (!coverImageLocalPath) {
        throw new ApiError(400, 'Cover image file is required');
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!coverImage.url) {
        throw new ApiError(500, 'Something went wrong while uploading cover image');
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        { $set: { coverImage: coverImage.url } },
        { new: true }
    ).select("-password -refreshToken");

    res.status(200).json(new ApiResponse(200, user, "Cover image updated successfully"));
});

// Example aggregation, adjust as needed for your schema
const getUserChannelProfile = asyncHandler(async (req, res) => {
    const { username } = req.params;

    if (!username?.trim()) {
        throw new ApiError(400, "Username is required");
    }

    const channel = await User.aggregate([
        {
            $match: {
                username: username.toLowerCase()
            }
        },
        // Add your $lookup and $addFields stages here as needed
    ]);

    res.status(200).json(new ApiResponse(200, channel[0], "Channel profile fetched successfully"));
});

const getWatchHistory = asyncHandler(async (req, res) => {
    // Implement your logic here
    res.status(200).json(new ApiResponse(200, [], "Watch history fetched successfully"));
});

export {
    registerUser,
    loginUser,
    refreshAccessToken,
    logoutUser,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory
};
