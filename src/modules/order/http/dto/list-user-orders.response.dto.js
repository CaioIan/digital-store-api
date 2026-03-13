class ListUserOrdersResponseDto {
  /**
   * Converte a lista de Models do Sequelize para o contrato do Frontend.
   * @param {Array} orders - Lista retornada pelo repositório.
   * @returns {Array} JSON formatado para a página "Meus Pedidos".
   */
  static fromDomain(orders) {
    return orders.map((order) => {
      const pInfo = order.personal_info || {};
      const dAddr = order.delivery_address || {};

      return {
        id: order.id,
        status: order.status,
        created_at: order.createdAt,
        total: parseFloat(order.total),
        // Snapshot dos dados no momento da compra (Garante integridade histórica)
        client: {
          name: pInfo.full_name || (order.user ? `${order.user.firstname} ${order.user.surname}` : "Cliente Desconhecido"),
          email: pInfo.email || (order.user ? order.user.email : ""),
          cpf: pInfo.cpf || "",
          phone: pInfo.phone || ""
        },
        address: {
          street: dAddr.address || "",
          number: dAddr.number || "",
          neighborhood: dAddr.neighborhood || "",
          city: dAddr.city || "",
          state: dAddr.state || "",
          cep: dAddr.cep || "",
          complement: dAddr.complement || ""
        },
        items: order.items.map((item) => ({
          product_id: item.product_id,
          product_name: item.product_name,
          image_url: item.image_url,
          quantity: item.quantity,
          price_at_purchase: parseFloat(item.price_at_purchase),
        })),
        // Mantemos os originais para compatibilidade se necessário
        personal_info: pInfo,
        delivery_address: dAddr
      };
    });
  }
}

module.exports = ListUserOrdersResponseDto;
