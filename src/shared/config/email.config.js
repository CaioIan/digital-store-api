/**
 * Configurações de Email - Feature Flags e Helpers
 * Gerencia comportamentos condicionais do sistema de email baseado em variáveis de ambiente.
 */

/**
 * Verifica se a verificação de email está habilitada no ambiente atual.
 * @returns {boolean} true se a verificação de email é obrigatória, false se desabilitada
 */
function isEmailVerificationEnabled() {
  const flag = process.env.EMAIL_VERIFICATION_ENABLED;

  // Se undefined, default para true (seguro por padrão - exigir verificação)
  if (flag === undefined) {
    console.warn(
      "[EmailConfig] EMAIL_VERIFICATION_ENABLED não configurado. Usando default: true (verificação obrigatória)",
    );
    return true;
  }

  // Converter string do .env para boolean
  // Aceita: "true", "1", "yes" → true
  // Aceita: "false", "0", "no" → false
  const isTruthy = ["true", "1", "yes"].includes(String(flag).toLowerCase());

  return isTruthy;
}

module.exports = {
  isEmailVerificationEnabled,
};
