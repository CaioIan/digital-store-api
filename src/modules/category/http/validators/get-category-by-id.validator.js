const { z } = require("zod");

const getCategoryByIdSchema = z.object({
  id: z.string().uuid({ message: "ID must be a valid UUID" }),
});

const getCategoryByIdValidator = (req, res, next) => {
  const result = getCategoryByIdSchema.safeParse(req.params);

  if (!result.success) {
    const errors = result.error.issues.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    }));
    return res.status(400).json({ errors });
  }
  next();
};

module.exports = { getCategoryByIdValidator };
