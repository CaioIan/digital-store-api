const { Resend } = require("resend");

/**
 * Provider responsável por configuração e disparo de emails via Resend.
 */
class EmailProvider {
  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY || process.env.SMTP_PASS);
  }

  async sendVerificationEmail(to, token) {
    const verificationUrl = `${process.env.API_URL || "http://localhost:3000"}/v1/user/verify-email?token=${token}`;
    const template = require("./templates/verification")(verificationUrl);

    try {
      const { data, error } = await this.resend.emails.send({
        from: process.env.MAIL_FROM || "Digital Store <onboarding@resend.dev>",
        to: [to],
        subject: "Verifique seu email - Digital Store",
        html: template,
      });

      if (error) {
        console.error("[EmailProvider] Erro do Resend ao enviar email:", error);
        throw new Error(error.message);
      }

      return true;
    } catch (error) {
      console.error("[EmailProvider] Erro ao enviar email de verificação:", error);
      throw error;
    }
  }
}

module.exports = new EmailProvider();
