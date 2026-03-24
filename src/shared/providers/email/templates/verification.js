module.exports = (verificationUrl) => `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: 'Inter', Helvetica, Arial, sans-serif;
      background-color: #f5f5f5;
      margin: 0;
      padding: 0;
    }
    .email-wrapper {
      width: 100%;
      background-color: #f5f5f5;
      padding: 40px 0;
    }
    .email-container {
      max-width: 500px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }
    .brand-header {
      background-color: #c92071;
      padding: 40px 32px;
      text-align: center;
    }
    .brand-header h1 {
      color: #ffffff;
      margin: 0;
      font-size: 24px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .email-body {
      padding: 48px 40px;
      text-align: center;
    }
    .email-body h2 {
      color: #1f1f1f;
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 16px;
      margin-top: 0;
    }
    .email-body p {
      color: #474747;
      font-size: 16px;
      line-height: 1.6;
      margin-bottom: 32px;
    }
    .btn-action {
      display: inline-block;
      background-color: #c92071;
      color: #ffffff !important;
      padding: 16px 48px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 700;
      font-size: 16px;
    }
    .footer {
      padding: 32px;
      text-align: center;
      background-color: #ffffff;
      border-top: 1px solid #f5f5f5;
    }
    .footer p {
      color: #8f8f8f;
      font-size: 12px;
      margin: 4px 0;
    }
    .fallback-link {
      margin-top: 24px;
      font-size: 12px;
      color: #8f8f8f;
      word-break: break-all;
    }
    .fallback-link a {
      color: #c92071;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="email-container">
      <div class="brand-header">
        <h1>Digital Store</h1>
      </div>
      <div class="email-body">
        <h2>Bem-vindo!</h2>
        <p>Estamos muito felizes em ter você conosco. Para ativar sua conta e começar a explorar nossas ofertas, confirme seu e-mail clicando no botão abaixo:</p>
        
        <a href="${verificationUrl}" class="btn-action">Ativar minha conta</a>
        
        <div class="fallback-link">
          Ou copie e cole este link no seu navegador:<br>
          <a href="${verificationUrl}">${verificationUrl}</a>
        </div>
      </div>
      <div class="footer">
        <p>Digital Store &copy; ${new Date().getFullYear()} - Todos os direitos reservados.</p>
        <p>Este é um e-mail automático, por favor não responda.</p>
      </div>
    </div>
  </div>
</body>
</html>
`;


