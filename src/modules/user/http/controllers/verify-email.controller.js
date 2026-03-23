const verifyEmailService = require("../../core/services/verify-email.service");
const verificationResultTemplate = require("../../../../shared/providers/email/templates/verification-result");

/**
 * @swagger
 * /v1/user/verify-email:
 *   get:
 *     summary: Verifica o e-mail do usuário
 *     description: |
 *       - Valida o token de verificação enviado por e-mail.
 *       - Ativa a conta do usuário.
 *       - Retorna uma página HTML com o resultado da operação.
 *     tags:
 *       - Usuários
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Token de verificação recebido por e-mail
 *     responses:
 *       200:
 *         description: E-mail verificado com sucesso (Retorna HTML)
 *       400:
 *         description: Token inválido ou expirado (Retorna HTML)
 */
class VerifyEmailController {
  /**
   * Recebe o token pela query string e aciona a verificação.
   * Retorna uma página HTML estilizada com o resultado.
   */
  async handle(req, res) {
    const { token } = req.query;
    
    try {
      await verifyEmailService.execute(token);
      
      return res.status(200).send(
        verificationResultTemplate({
          success: true,
          message: "Seu endereço de e-mail foi verificado com sucesso. Você já pode acessar sua conta e aproveitar a Digital Store!"
        })
      );
    } catch (error) {
      const statusCode = error.statusCode || 400;
      const message = error.message || "Não foi possível validar seu e-mail. O link pode estar expirado ou ser inválido.";
      
      return res.status(statusCode).send(
        verificationResultTemplate({
          success: false,
          message: message
        })
      );
    }
  }
}

module.exports = new VerifyEmailController();

