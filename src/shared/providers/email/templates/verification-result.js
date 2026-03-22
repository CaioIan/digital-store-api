module.exports = ({ success, message }) => `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verificação de Email - Digital Store</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
      --color-primary: #c92071;
      --color-secondary: #b5b6f2;
      --color-tertiary: #991956;
      --color-error: #ee4266;
      --color-success: #52ca76;
      --color-warning: #f6aa1c;
      --color-dark-gray: #1f1f1f;
      --color-dark-gray-2: #474747;
      --color-white: #ffffff;
    }

    body {
      font-family: var(--font-sans);
      background-color: #f5f5f5;
      margin: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 20px;
    }

    .container {
      background-color: var(--color-white);
      max-width: 450px;
      width: 100%;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 10px 25px rgba(0,0,0,0.1);
      text-align: center;
    }

    .header {
      background: var(--color-primary);
      padding: 60px 20px;
    }

    .header h1 {
      color: var(--color-white);
      margin: 0;
      font-size: 28px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .content {
      padding: 40px;
    }

    .icon {
      font-size: 64px;
      margin-bottom: 24px;
      display: block;
    }

    .status-success { color: var(--color-success); }
    .status-error { color: var(--color-error); }

    h2 {
      color: var(--color-dark-gray);
      font-size: 24px;
      margin-top: 0;
      margin-bottom: 16px;
    }

    p {
      color: var(--color-dark-gray-2);
      line-height: 1.6;
      margin-bottom: 32px;
    }

    .btn {
      display: inline-block;
      background-color: var(--color-primary);
      color: var(--color-white);
      text-decoration: none;
      padding: 14px 40px;
      border-radius: 8px;
      font-weight: 600;
      transition: background-color 0.2s;
    }

    .btn:hover {
      background-color: var(--color-tertiary);
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Digital Store</h1>
    </div>
    <div class="content">
      <span class="icon ${success ? 'status-success' : 'status-error'}">
        ${success ? '✓' : '✕'}
      </span>
      <h2>${success ? 'Email Verificado!' : 'Ops! Algo deu errado'}</h2>
      <p>${message}</p>
      <a href="http://localhost:5173/login" class="btn">Ir para Login</a>
    </div>

  </div>
</body>
</html>
`;
