const OrderRepository = require("../../persistence/order.repository");

/**
 * Serviço responsável por coordenar a criação do pedido (Checkout).
 * Prepara e mascaicações logicas e delega a transação principal para o repositório.
 */
class CreateOrderService {
  /**
   * Finaliza o checkout a partir de um request válido.
   * @param {Object} data - Payload de entrada (dados do req.body validados).
   * @param {string} data.user_id - Usuário que está comprando.
   * @param {Object} data.personal_info - Informação pessoal.
   * @param {Object} data.delivery_address - Informação de entrega.
   * @param {Object} data.payment - Informação de pagamento completa do front.
   * @returns {Promise<{ order_id: string }>} O ID numérico gerado pelo fechamento do pedido.
   */
  async execute({ user_id, personal_info, delivery_address, payment }) {
    // 1. Preparar payment_info: Mascarar cartão ou limpar dependendo do método
    let payment_info = {};

    if (payment.method === "credit-card") {
      payment_info = {
        method: "credit-card",
        card_holder: payment.card_holder,
        last_digits: payment.card_number ? payment.card_number.slice(-4) : null,
        installments: payment.installments || 1,
      };
    } else {
      // Boleto, PIX, etc
      payment_info = {
        method: payment.method,
        installments: 1,
      };
    }

    // 2. Transaciona o fechamento no repositorio
    const result = await OrderRepository.checkoutCartToOrder(user_id, {
      personal_info,
      delivery_address,
      payment_info,
    });

    return result;
  }
}

module.exports = new CreateOrderService();
