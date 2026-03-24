const nodemailer = require("nodemailer");

/**
 * Provider responsável por configuração e disparo de emails.
 */
class EmailProvider {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.ethereal.email",
      port: process.env.SMTP_PORT || 587,
      auth: {
        user: process.env.SMTP_USER || "ethereal.user@ethereal.email",
        pass: process.env.SMTP_PASS || "fake_password",
      },
    });
  }

  async sendVerificationEmail(to, token) {
    const verificationUrl = `${process.env.API_URL || "http://localhost:3000"}/v1/user/verify-email?token=${token}`;
    const template = require("./templates/verification")(verificationUrl);

    try {
      const info = await this.transporter.sendMail({
        from: '"Digital Store" <no-reply@digitalstore.com>',
        to,
        subject: "Verifique seu email - Digital Store",
        html: template,
      });
      console.log(`[EmailProvider] Email de verificação enviado: ${info.messageId}`);
      if (info.messageId && process.env.SMTP_HOST === 'smtp.ethereal.email') {
        console.log(`[EmailProvider] Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
      }
      return true;
    } catch (error) {
      console.error("[EmailProvider] Erro ao enviar email de verificação:", error);
      throw error;
    }
  }
}

module.exports = new EmailProvider();
