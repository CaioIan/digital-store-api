const cloudinary = require("../../config/cloudinary.config");

/**
 * Retorna a URL da imagem (já deve estar no Cloudinary via upload-image endpoint).
 * @param {string} content - URL do Cloudinary.
 * @param {string} mimeType - O tipo MIME da imagem (não usado, mantido por compatibilidade).
 * @returns {Promise<string>} A URL da imagem.
 */
async function processImage(content, mimeType) {
  // Apenas retorna a URL, pois o upload já foi feito via /v1/product/upload-image
  return content;
}

module.exports = { processImage };
