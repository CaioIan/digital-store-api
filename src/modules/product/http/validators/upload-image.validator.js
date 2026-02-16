const { z } = require("zod");

// Schema para upload de imagem
const uploadImageSchema = z.object({
  type: z.string({ required_error: "Image type is required" }).refine(
    (val) => val.startsWith("image/"),
    { message: "Type must be a valid image mime type (e.g., image/png, image/jpeg)" }
  ),
  content: z.string({ required_error: "Image content is required" }).min(1, "Image content cannot be empty"),
});

// Middleware para usar na rota
const uploadImageValidator = (req, res, next) => {
  // Se é upload de arquivo (multer), pula validação JSON
  if (req.file) {
    return next();
  }

  // Valida JSON
  const result = uploadImageSchema.safeParse(req.body);

  if (!result.success) {
    const errors = result.error.issues.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    }));
    return res.status(400).json({ errors });
  }

  req.body = result.data;
  next();
};

module.exports = { uploadImageValidator };
