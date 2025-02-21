import cloudinary from 'cloudinary';

const uploadImageOnCloudinary = async (file, folder, height, quality) => {
    const options = { folder };  // Folder is correctly set

    if (height) options.height = height;
    if (quality) options.quality = quality;

    options.resource_type = "auto"; // Correct key

    return await cloudinary.uploader.upload(file.tempFilePath, options);
};

export default uploadImageOnCloudinary;
