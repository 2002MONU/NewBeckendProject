import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import dotenv from "dotenv";
dotenv.config();

// Cloudinary configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

export const uploadOnCloudinary = async (localPath) => {
    try {
        if (!localPath) return null;

        const response = await cloudinary.uploader.upload(localPath, {
            resource_type: 'image',
            use_filename: true,
            unique_filename: false
        });

        console.log('Upload Result:', response.url);

        fs.unlinkSync(localPath); // delete local file after upload
        return response;

    } catch (error) {
        console.error("Cloudinary upload error:", error);
        if (fs.existsSync(localPath)) {
            fs.unlinkSync(localPath); // cleanup if file exists
        }
        throw error;
    }
};
