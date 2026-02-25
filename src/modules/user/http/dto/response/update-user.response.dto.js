const { z } = require("zod");

/** Schema Zod que define o formato da resposta de atualização de usuário. */
const updateUserResponseSchema = z.object({
  id: z.uuid(),
  firstname: z.string(),
  surname: z.string(),
  cpf: z.string(),
  phone: z.string(),
  email: z.email(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

/**
 * DTO responsável por filtrar e validar o payload de resposta de atualização de usuário.
 * Garante que apenas campos permitidos sejam expostos ao cliente.
 */
const UpdateUserResponseDto = {
  /**
   * Transforma um registro bruto de usuário no formato padronizado da API.
   * @param {Object} payload - Dados brutos do usuário vindos da camada de service.
   * @returns {Object} Resposta filtrada com id, firstname, surname, cpf, phone, email, createdAt e updatedAt.
   */
  toResponse(payload) {
    return updateUserResponseSchema.parse(payload);
  },
};

module.exports = UpdateUserResponseDto;
