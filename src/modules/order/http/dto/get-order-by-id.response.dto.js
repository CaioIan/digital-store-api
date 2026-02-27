class GetOrderByIdResponseDto {
  /**
   * Converte a Model do Sequelize para o Contrato exato requisitado pelo Frontend.
   * @param {Object} order - Retorno do order.repository
   * @returns {Object} JSON formatado da Nota Fiscal.
   */
  static fromDomain(order) {
    return {
      id: order.id,
      status: order.status,
      created_at: order.createdAt,
      personal_info: order.personal_info,
      delivery_address: order.delivery_address,
      payment_info: order.payment_info,
      items: order.items.map((item) => ({
        id: item.id,
        product_id: item.product_id,
        product_name: item.product_name,
        image_url: item.image_url,
        quantity: item.quantity,
        price_at_purchase: parseFloat(item.price_at_purchase),
      })),
      summary: {
        subtotal: parseFloat(order.subtotal),
        shipping: parseFloat(order.shipping),
        discount: parseFloat(order.discount),
        total: parseFloat(order.total),
      },
    };
  }
}

module.exports = GetOrderByIdResponseDto;
