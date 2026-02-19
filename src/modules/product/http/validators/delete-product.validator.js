const { z } = require("zod");

const deleteProductSchema = z.object({
  id: z.coerce
    .number()
    .int()
    .positive({ message: "ID must be a positive integer" }),
});

const deleteProductValidator = (req, res, next) => {
  const result = deleteProductSchema.safeParse(req.params);

  if (!result.success) {
    const errors = result.error.issues.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    }));
    return res.status(400).json({ errors });
  }

  req.params.id = result.data.id;
  next();
};

module.exports = { deleteProductValidator };
