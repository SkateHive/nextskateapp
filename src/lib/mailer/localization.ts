export function getLocalizedStrings(language: string) {
  // Define a type for the language strings object for better type safety
  type LanguageStrings = {
    [key: string]: {
      colors: {
        background1: string;
        background2: string;
        foreground1: string;
        foreground2: string;
        keyBackground: string;
        alertBackground: string;
        highlightBackground: string;
        link: string; // Added link color
        codeText: string; // Added code text color
        helpText: string; // Added help text color
      };
      welcomeMessage: string;
      onboardedMessage: string;
      keepKeysSafeMessage: string;
      usernameLabel: string;
      masterPasswordLabel: string;
      importKeysMessage: string;
      ownerKeyLabel: string;
      activeKeyLabel: string;
      postingKeyLabel: string;
      memoKeyLabel: string;
      importantMessage: string;
      keysDescriptionTitle: string;
      postingKeyDescription: string;
      activeKeyDescription: string;
      memoKeyDescription: string;
      ownerKeyDescription: string;
      keysRulesTitle: string;
      keysRules: string;
      footerMessage: string;
      introParagraph: string;
      howToLoginTitle: string;
      installKeychainStep: string;
      openKeychainStep: string;
      enterDetailsStep: string;
      readyStep: string;
      ctaAltText: string;
      ctaHelpText: string;
      warningMessage: string;
      keysExplanationTitle: string;
      footerLinkText: string;
    };
  };

  const strings: LanguageStrings = {
    EN: {
      colors: {
        background1: '#121212', // Updated background
        background2: '#333',
        foreground1: '#4caf50',
        foreground2: '#e0e0e0',
        keyBackground: '#1e1e1e', // Updated key background
        alertBackground: '#d32f2f',
        highlightBackground: '#2e7d32',
        link: '#4caf50', // Link color
        codeText: '#ccc', // Code text color
        helpText: '#aaa', // Help text color
      },
      welcomeMessage: 'Welcome to Skate Hive',
      onboardedMessage: '@{createdby} just invited you to skatehive!', // Updated message
      keepKeysSafeMessage: 'Here is your user details and keys. Remember to not share your keys and always keep them safe!', // Kept for attachment text, maybe remove if not needed
      usernameLabel: 'Username:', // Added colon
      masterPasswordLabel: 'Master Password:', // Added colon
      importKeysMessage: 'When you login using the Master Password, it will import your Post, Active, and Memo keys.', // Kept for attachment text, maybe remove if not needed
      ownerKeyLabel: 'Owner Private Key',
      activeKeyLabel: 'Active Private Key',
      postingKeyLabel: 'Posting Private Key',
      memoKeyLabel: 'Memo Private Key',
      importantMessage: 'IMPORTANT: Be very careful using your keys on any other website or application not using a keychain!', // Kept for attachment text, maybe remove if not needed
      keysDescriptionTitle: 'KEYS DESCRIPTION', // Kept for attachment text, maybe remove if not needed
      keysRulesTitle: 'Keys 5 rules:', // Kept for attachment text, maybe remove if not needed
      keysRules: '- DO NOT LOSE YOUR KEYS<br>- DO NOT LOSE YOUR KEYS<br>- DO NOT LOSE YOUR KEYS<br>- DO NOT SHARE YOUR KEYS<br>- KEEP YOUR KEYS SAFE<br>', // Kept for attachment text, maybe remove if not needed
      footerMessage: 'We recommend using the Hive Keychain on ALL Hive sites and applications.', // Kept for attachment text, maybe remove if not needed
      // New/Updated strings
      introParagraph: "You're now part of the Skate Hive community. Below are your login details. Keep your <strong>Master Password</strong> safe — it’s your key to everything.",
      howToLoginTitle: "How to log in for the first time:",
      installKeychainStep: "<strong>Install Hive Keychain:</strong><br> 👉 <a href=\"https://hive-keychain.com/\" target=\"_blank\" style=\"color: #4caf50;\">https://hive-keychain.com/</a>",
      openKeychainStep: "<strong>Open the extension or app</strong> and click on \"Import Account\".",
      enterDetailsStep: "<strong>Enter your username</strong> (<code style=\"color:#ccc;\">{desiredUsername}</code>) and paste your Master Password.", // Placeholder added
      readyStep: "<strong>You're ready to go!</strong> You can now log in to <a href=\"https://skatehive.app/\" style=\"color: #4caf50;\">Skatehive.app</a> and other Hive apps securely.",
      ctaAltText: "Watch Tutorial",
      ctaHelpText: "Need help? Watch the tutorial above ☝️",
      warningMessage: "NEVER share your keys. NEVER lose your keys. Keep them safe.",
      keysExplanationTitle: "What are these keys?",
      postingKeyDescription: "<strong>Posting:</strong> Post, comment, follow, reblog.",
      activeKeyDescription: "<strong>Active:</strong> Wallet and funds.",
      memoKeyDescription: "<strong>Memo:</strong> Encrypted messages in transfers.",
      ownerKeyDescription: "<strong>Owner:</strong> Recover/change your account.",
      footerLinkText: "Visit Skatehive.app",
    },
    'PT-BR': {
      colors: {
        background1: '#121212',
        background2: '#333',
        foreground1: '#4caf50',
        foreground2: '#e0e0e0',
        keyBackground: '#1e1e1e',
        alertBackground: '#d32f2f',
        highlightBackground: '#2e7d32',
        link: '#4caf50',
        codeText: '#ccc',
        helpText: '#aaa',
      },
      welcomeMessage: 'Bem-vindo ao Skate Hive',
      onboardedMessage: '@{createdby} acabou de te convidar para o skatehive!',
      keepKeysSafeMessage: 'Aqui estão seus detalhes de usuário e chaves. Lembre-se de não compartilhar suas chaves e sempre mantê-las seguras!',
      usernameLabel: 'Nome de usuário:',
      masterPasswordLabel: 'Senha Mestra:',
      importKeysMessage: 'Ao fazer login usando a Senha Mestra, suas chaves de Postagem, Ativa e Memo serão importadas.',
      ownerKeyLabel: 'Chave Privada Owner',
      activeKeyLabel: 'Chave Privada Active',
      postingKeyLabel: 'Chave Privada Posting',
      memoKeyLabel: 'Chave Privada Memo',
      importantMessage: 'IMPORTANTE: Tenha muito cuidado ao usar suas chaves em qualquer outro site ou aplicativo que não use uma keychain!',
      keysDescriptionTitle: 'DESCRIÇÃO DAS CHAVES',
      keysRulesTitle: '5 regras das chaves:',
      keysRules: '- NÃO PERCA SUAS CHAVES<br>- NÃO PERCA SUAS CHAVES<br>- NÃO PERCA SUAS CHAVES<br>- NÃO COMPARTILHE SUAS CHAVES<br>- MANTENHA SUAS CHAVES SEGURAS<br>',
      footerMessage: 'Recomendamos usar a Hive Keychain em TODOS os sites e aplicativos Hive.',
      // New/Updated strings PT-BR
      introParagraph: "Você agora faz parte da comunidade Skate Hive. Abaixo estão seus detalhes de login. Mantenha sua <strong>Senha Mestra</strong> segura — ela é sua chave para tudo.",
      howToLoginTitle: "Como fazer login pela primeira vez:",
      installKeychainStep: "<strong>Instale o Hive Keychain:</strong><br> 👉 <a href=\"https://hive-keychain.com/\" target=\"_blank\" style=\"color: #4caf50;\">https://hive-keychain.com/</a>",
      openKeychainStep: "<strong>Abra a extensão ou app</strong> e clique em \"Importar Conta\".",
      enterDetailsStep: "<strong>Digite seu nome de usuário</strong> (<code style=\"color:#ccc;\">{desiredUsername}</code>) e cole sua Senha Mestra.",
      readyStep: "<strong>Pronto!</strong> Agora você pode fazer login no <a href=\"https://skatehive.app/\" style=\"color: #4caf50;\">Skatehive.app</a> e outros apps Hive com segurança.",
      ctaAltText: "Assistir Tutorial",
      ctaHelpText: "Precisa de ajuda? Assista ao tutorial acima ☝️",
      warningMessage: "NUNCA compartilhe suas chaves. NUNCA perca suas chaves. Mantenha-as seguras.",
      keysExplanationTitle: "O que são essas chaves?",
      postingKeyDescription: "<strong>Posting:</strong> Postar, comentar, seguir, reblogar.",
      activeKeyDescription: "<strong>Active:</strong> Carteira e fundos.",
      memoKeyDescription: "<strong>Memo:</strong> Mensagens criptografadas em transferências.",
      ownerKeyDescription: "<strong>Owner:</strong> Recuperar/alterar sua conta.",
      footerLinkText: "Visite Skatehive.app",
    },
    ES: {
      colors: {
        background1: '#121212',
        background2: '#333',
        foreground1: '#4caf50',
        foreground2: '#e0e0e0',
        keyBackground: '#1e1e1e',
        alertBackground: '#d32f2f',
        highlightBackground: '#2e7d32',
        link: '#4caf50',
        codeText: '#ccc',
        helpText: '#aaa',
      },
      welcomeMessage: 'Bienvenido a Skate Hive',
      onboardedMessage: '¡@{createdby} acaba de invitarte a skatehive!',
      keepKeysSafeMessage: 'Aquí tienes los detalles de tu usuario y tus claves. ¡Recuerda no compartir tus claves y mantenerlas siempre seguras!',
      usernameLabel: 'Nombre de usuario:',
      masterPasswordLabel: 'Contraseña Maestra:',
      importKeysMessage: 'Cuando inicies sesión con la Contraseña Maestra, se importarán tus claves de Publicación, Activa y Memo.',
      ownerKeyLabel: 'Clave Privada Owner',
      activeKeyLabel: 'Clave Privada Active',
      postingKeyLabel: 'Clave Privada Posting',
      memoKeyLabel: 'Clave Privada Memo',
      importantMessage: 'IMPORTANTE: ¡Ten mucho cuidado al usar tus claves en cualquier otro sitio web o aplicación que no utilice una keychain!',
      keysDescriptionTitle: 'DESCRIPCIÓN DE LAS CLAVES',
      keysRulesTitle: '5 reglas de las claves:',
      keysRules: '- NO PIERDAS TUS CLAVES<br>- NO PIERDAS TUS CLAVES<br>- NO PIERDAS TUS CLAVES<br>- NO COMPARTAS TUS CLAVES<br>- MANTÉN TUS CLAVES SEGURAS<br>',
      footerMessage: 'Recomendamos usar Hive Keychain en TODOS los sitios y aplicaciones de Hive.',
      // New/Updated strings ES
      introParagraph: "Ahora eres parte de la comunidad Skate Hive. A continuación, tus datos de inicio de sesión. Mantén tu <strong>Contraseña Maestra</strong> segura — es tu llave para todo.",
      howToLoginTitle: "Cómo iniciar sesión por primera vez:",
      installKeychainStep: "<strong>Instala Hive Keychain:</strong><br> 👉 <a href=\"https://hive-keychain.com/\" target=\"_blank\" style=\"color: #4caf50;\">https://hive-keychain.com/</a>",
      openKeychainStep: "<strong>Abre la extensión o app</strong> y haz clic en \"Importar Cuenta\".",
      enterDetailsStep: "<strong>Ingresa tu nombre de usuario</strong> (<code style=\"color:#ccc;\">{desiredUsername}</code>) y pega tu Contraseña Maestra.",
      readyStep: "<strong>¡Listo!</strong> Ahora puedes iniciar sesión en <a href=\"https://skatehive.app/\" style=\"color: #4caf50;\">Skatehive.app</a> y otras apps de Hive de forma segura.",
      ctaAltText: "Ver Tutorial",
      ctaHelpText: "¿Necesitas ayuda? Mira el tutorial de arriba ☝️",
      warningMessage: "NUNCA compartas tus claves. NUNCA pierdas tus claves. Mantenlas seguras.",
      keysExplanationTitle: "¿Qué son estas claves?",
      postingKeyDescription: "<strong>Posting:</strong> Publicar, comentar, seguir, rebloguear.",
      activeKeyDescription: "<strong>Active:</strong> Billetera y fondos.",
      memoKeyDescription: "<strong>Memo:</strong> Mensajes cifrados en transferencias.",
      ownerKeyDescription: "<strong>Owner:</strong> Recuperar/cambiar tu cuenta.",
      footerLinkText: "Visita Skatehive.app",
    },
  };

  // Fallback to English if the requested language doesn't exist
  return strings[language] || strings.EN;
}
