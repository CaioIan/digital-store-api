const UploadImageService = require("../../core/services/upload-image.service");
const UploadImageResponseDto = require("../dto/response/upload-image.response.dto");

class UploadImageController {
  async handle(req, res) {
    try {
      let type, content;

      // Detecta se é upload de arquivo (multipart/form-data) ou JSON
      if (req.file) {
        // Upload de arquivo via multer
        type = req.file.mimetype;
        content = req.file.buffer.toString("base64");
      } else if (req.body && req.body.type && req.body.content) {
        // JSON com base64
        type = req.body.type;
        content = req.body.content;
      } else {
        return res.status(400).json({ error: "Envie um arquivo ou JSON com type e content" });
      }

      const result = await UploadImageService.execute({ type, content });
      return res.status(200).json(UploadImageResponseDto.toResponse(result));
    } catch (error) {
      console.error("UploadImageController error:", error);
      return res.status(400).json({ error: error.message || "Erro ao fazer upload da imagem" });
    }
  }
}

module.exports = new UploadImageController();
