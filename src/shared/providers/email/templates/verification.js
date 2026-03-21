module.exports = (verificationUrl) => `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; }
    .container { background-color: #fff; padding: 30px; border-radius: 8px; max-width: 600px; margin: 0 auto; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .btn { display: inline-block; padding: 12px 24px; margin-top: 20px; background-color: #c2756f; color: #fff; text-decoration: none; border-radius: 5px; font-weight: bold; }
    .btn:hover { background-color: #a8625d; cursor: pointer; }
  </style>
</head>
<body>
  <div class="container">
    <h2>Bem-vindo à Digital Store!</h2>
    <p>Obrigado por se cadastrar. Falta pouco para começar a comprar conosco!</p>
    <p>Por favor, clique no botão abaixo para verificar seu endereço de email:</p>
    <a href="${verificationUrl}" class="btn">Verificar Email</a>
    <p style="font-size: 12px; color: #888; margin-top: 30px; border-top: 1px solid #d3d3d3; padding-top: 10px;">
      Se você não solicitou este cadastro, pode ignorar este email com segurança.
    </p>
  </div>
</body>
</html>
`;
