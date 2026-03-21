const verifyEmailService = require("../../core/services/verify-email.service");

class VerifyEmailController {
  /**
   * Recebe o token pela query string e aciona a verificação.
   */
  async handle(req, res) {
    const { token } = req.query;
    
    await verifyEmailService.execute(token);
    
    return res.status(200).json({
      message: "Endereço de email verificado com sucesso. Você já pode fazer login."
    });
  }
}

module.exports = new VerifyEmailController();
