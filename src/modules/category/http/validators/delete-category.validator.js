const { z } = require("zod");

const deleteCategorySchema = z.object({
  id: z.string().uuid({ message: "ID must be a valid UUID" }),
});

const deleteCategoryValidator = (req, res, next) => {
  const result = deleteCategorySchema.safeParse(req.params);

  if (!result.success) {
    const errors = result.error.issues.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    }));
    return res.status(400).json({ errors });
  }
  next();
};

module.exports = { deleteCategoryValidator };
