// ============ ATUALIZAÇÃO DE RELACIONAMENTOS ============

it("PATCH /v1/product/:id - Deve atualizar opções do produto com sucesso", async () => {
  const token = generateToken(adminPayload);
  const newOptions = [
    {
      title: "Tamanho Novo",
      shape: "circle",
      radius: 0,
      type: "text",
      values: ["XL", "XXL"],
    },
  ];

  const response = await request(app)
    .patch(`/v1/product/${testProduct.id}`)
    .set("Authorization", `Bearer ${token}`)
    .send({ options: newOptions });

  expect(response.status).toBe(200);
  expect(response.body.options).toHaveLength(1);
  expect(response.body.options[0].title).toBe("Tamanho Novo");

  // Verifica valores no banco (precisa parsear pois vem como string JSON se não usar o getter do model corretamente,
  // mas o repository findById usa include que deve trazer estruturado sem o getter explícito se configurado,
  // ou raw string. O teste anterior validou creation, vamos assumir comportamento similar)
  // O retorno da API já deve vir parseado se o model/serializer estiver correto.
  // Mas vamos checar o banco diretamente:
  const optionsDb = await ProductOption.findAll({ where: { product_id: testProduct.id } });
  expect(optionsDb).toHaveLength(1);
  expect(optionsDb[0].title).toBe("Tamanho Novo");
});

it("PATCH /v1/product/:id - Deve atualizar categorias do produto com sucesso", async () => {
  const token = generateToken(adminPayload);
  // Cria nova categoria
  const newCategory = await Category.create({ name: "Nova Cat", slug: "nova-cat", use_in_menu: true });

  const response = await request(app)
    .patch(`/v1/product/${testProduct.id}`)
    .set("Authorization", `Bearer ${token}`)
    .send({ category_ids: [newCategory.id] });

  expect(response.status).toBe(200);

  // Verifica se a categoria foi atualizada
  const product = await Product.findByPk(testProduct.id, { include: ["categories"] });
  expect(product.categories).toHaveLength(1);
  expect(product.categories[0].id).toBe(newCategory.id);
});
