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

/** Schema para a resposta completa que pode incluir uma mensagem. */
const createUserWithMessageSchema = z.object({
  user: createUserResponseSchema,
  message: z.string().optional(),
});

/**
 * DTO responsável por filtrar e validar o payload de resposta de criação de usuário.
 * Garante que apenas campos permitidos sejam expostos ao cliente.
 *
 * PADRÃO DE DETECÇÃO (Feature Flag Email Verification):
 * - Se resposta tem `message` → EMAIL_VERIFICATION_ENABLED=true (verificação habilitada)
 * - Se resposta NÃO tem `message` → EMAIL_VERIFICATION_ENABLED=false (desabilitada)
 *
 * O frontend usa esse padrão para auto-detectar qual modo está ativo sem necessidade
 * de configurações adicionais ou chamadas de API.
 */
const CreateUserResponseDto = {
  /**
   * Transforma um registro bruto de usuário no formato padronizado da API.
   * Pode retornar apenas user ou user + message (baseado na feature flag EMAIL_VERIFICATION_ENABLED).
   *
   * Exemplos:
   * - COM verificação: { user: {...}, message: "Email de verificação enviado..." }
   * - SEM verificação: { user: {...} } (sem message!)
   *
   * @param {Object} payload - Pode ser um objeto user ou objeto {user, message} vindo do service.
   * @returns {Object} Resposta filtrada contendo user (com dados) e opcionalmente message.
   */
  toResponse(payload) {
    const response = createUserWithMessageSchema.parse(payload);

    // Validar o user antes de retornar
    const validatedUser = createUserResponseSchema.parse(response.user);

    return {
      user: validatedUser,
      ...(response.message && { message: response.message }), // Incluir message apenas se existir
    };
  },
};

module.exports = CreateUserResponseDto;
