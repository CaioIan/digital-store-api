const cloudinary = require("../../../../config/cloudinary.config");

class UploadImageService {
  async execute({ type, content }) {
    // Faz upload do base64 para o Cloudinary
    const dataUri = `data:${type};base64,${content}`;

    const result = await cloudinary.uploader.upload(dataUri, {
      folder: "products",
      resource_type: "image",
    });

    return {
      url: result.secure_url,
      public_id: result.public_id,
    };
  }
}

module.exports = new UploadImageService();
