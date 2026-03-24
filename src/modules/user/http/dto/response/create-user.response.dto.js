const { z } = require("zod");

/** Schema do endereço na resposta. */
const addressResponseSchema = z.object({
  id: z.string(),
  endereco: z.string(),
  bairro: z.string(),
  cidade: z.string(),
  estado: z.string().nullable(),
  cep: z.string(),
  complemento: z.string().nullable(),
});

/** Schema Zod que define o formato da resposta de criação de usuário. */
const createUserResponseSchema = z.object({
  id: z.uuid(),
  firstname: z.string(),
  surname: z.string(),
  cpf: z.string(),
  phone: z.string(),
  email: z.email(),
  addresses: z.array(addressResponseSchema).optional().default([]),
});

/**
 * DTO responsável por filtrar e validar o payload de resposta de criação de usuário.
 * Garante que apenas campos permitidos sejam expostos ao cliente.
 */
const CreateUserResponseDto = {
  /**
   * Transforma um registro bruto de usuário no formato padronizado da API.
   * @param {Object} payload - Dados brutos do usuário vindos da camada de service.
   * @returns {Object} Resposta filtrada contendo id, firstname, surname, cpf, email e addresses.
   */
  toResponse(payload) {
    return createUserResponseSchema.parse(payload);
  },
};

module.exports = CreateUserResponseDto;

