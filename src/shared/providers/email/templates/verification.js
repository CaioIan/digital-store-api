module.exports = (verificationUrl) => `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --font-sans: 'Inter', ui-sans-serif, system-ui, sans-serif;
      --color-primary: #c92071;
      --color-secondary: #b5b6f2;
      --color-tertiary: #991956;
      --color-dark-gray: #1f1f1f;
      --color-dark-gray-2: #474747;
      --color-light-gray: #8f8f8f;
      --color-light-gray-3: #f5f5f5;
      --color-white: #ffffff;
    }
    body {
      font-family: var(--font-sans);
      background-color: var(--color-light-gray-3);
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }
    .email-wrapper {
      width: 100%;
      background-color: var(--color-light-gray-3);
      padding: 40px 0;
    }
    .email-container {
      max-width: 500px;
      margin: 0 auto;
      background-color: var(--color-white);
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }
    .brand-header {
      background: var(--color-primary);
      padding: 40px 32px;
      text-align: center;
    }
    .brand-header img {
      max-height: 40px;
      margin-bottom: 20px;
    }
    .brand-header h1 {
      color: var(--color-white);
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
      color: var(--color-dark-gray);
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 16px;
      margin-top: 0;
    }
    .email-body p {
      color: var(--color-dark-gray-2);
      font-size: 16px;
      line-height: 1.6;
      margin-bottom: 32px;
    }
    .btn-action {
      display: inline-block;
      background-color: var(--color-primary);
      color: var(--color-white) !important;
      padding: 16px 48px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 700;
      font-size: 16px;
      transition: background-color 0.2s;
    }
    .btn-action:hover {
      background-color: var(--color-tertiary);
    }
    .footer {
      padding: 32px;
      text-align: center;
      background-color: var(--color-white);
      border-top: 1px solid var(--color-light-gray-3);
    }
    .footer p {
      color: var(--color-light-gray);
      font-size: 12px;
      margin: 4px 0;
    }
    .fallback-link {
      margin-top: 24px;
      font-size: 12px;
      color: var(--color-light-gray);
      word-break: break-all;
    }
    .fallback-link a {
      color: var(--color-primary);
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


