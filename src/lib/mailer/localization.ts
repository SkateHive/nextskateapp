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
    };
  };

  const strings: LanguageStrings = {
    EN: {
      colors: {
        background1: '#1e1e1e',
        background2: '#333',
        foreground1: '#4caf50',
        foreground2: '#e0e0e0',
        keyBackground: '#2c2c2c',
        alertBackground: '#d32f2f',
        highlightBackground: '#2e7d32',
      },
      welcomeMessage: 'Welcome to Skate Hive',
      onboardedMessage: 'Hey skater, @{createdby} onboarded you into Skate Hive Community.',
      keepKeysSafeMessage: 'Here is your user details and keys. Remember to not share your keys and always keep them safe!',
      usernameLabel: 'Username',
      masterPasswordLabel: 'Master Password',
      importKeysMessage: 'When you login using the Master Password, it will import your Post, Active, and Memo keys.',
      ownerKeyLabel: 'Owner Private Key',
      activeKeyLabel: 'Active Private Key',
      postingKeyLabel: 'Posting Private Key',
      memoKeyLabel: 'Memo Private Key',
      importantMessage: 'IMPORTANT: Be very careful using your keys on any other website or application not using a keychain!',
      keysDescriptionTitle: 'KEYS DESCRIPTION',
      postingKeyDescription: 'Post, Comment, Vote, Reblog, Follow, Profile',
      activeKeyDescription: 'Wallet and Funds Management. Also the posting key attributes.',
      memoKeyDescription: 'Send/View encrypted messages on transfers',
      ownerKeyDescription: 'Change Password, Change Keys, Recover Account',
      keysRulesTitle: 'Keys 5 rules:',
      keysRules: '- DO NOT LOSE YOUR KEYS<br>- DO NOT LOSE YOUR KEYS<br>- DO NOT LOSE YOUR KEYS<br>- DO NOT SHARE YOUR KEYS<br>- KEEP YOUR KEYS SAFE<br>',
      footerMessage: 'We recommend using the Hive Keychain on ALL Hive sites and applications.',
    },
    'PT-BR': {
      colors: {
        background1: '#1e1e1e',
        background2: '#333',
        foreground1: '#4caf50',
        foreground2: '#e0e0e0',
        keyBackground: '#2c2c2c',
        alertBackground: '#d32f2f',
        highlightBackground: '#2e7d32',
      },
      welcomeMessage: 'Bem-vindo ao Skate Hive',
      onboardedMessage: 'E aí skatista, @{createdby} te convidou para a Comunidade Skate Hive.',
      keepKeysSafeMessage: 'Aqui estão seus detalhes de usuário e chaves. Lembre-se de não compartilhar suas chaves e sempre mantê-las seguras!',
      usernameLabel: 'Nome de usuário',
      masterPasswordLabel: 'Senha Mestra',
      importKeysMessage: 'Ao fazer login usando a Senha Mestra, suas chaves de Postagem, Ativa e Memo serão importadas.',
      ownerKeyLabel: 'Chave Privada Owner',
      activeKeyLabel: 'Chave Privada Active',
      postingKeyLabel: 'Chave Privada Posting',
      memoKeyLabel: 'Chave Privada Memo',
      importantMessage: 'IMPORTANTE: Tenha muito cuidado ao usar suas chaves em qualquer outro site ou aplicativo que não use uma keychain!',
      keysDescriptionTitle: 'DESCRIÇÃO DAS CHAVES',
      postingKeyDescription: 'Postar, Comentar, Votar, Reblogar, Seguir, Perfil',
      activeKeyDescription: 'Gerenciamento de Carteira e Fundos. Também os atributos da chave de postagem.',
      memoKeyDescription: 'Enviar/Ver mensagens criptografadas em transferências',
      ownerKeyDescription: 'Mudar Senha, Mudar Chaves, Recuperar Conta',
      keysRulesTitle: '5 regras das chaves:',
      keysRules: '- NÃO PERCA SUAS CHAVES<br>- NÃO PERCA SUAS CHAVES<br>- NÃO PERCA SUAS CHAVES<br>- NÃO COMPARTILHE SUAS CHAVES<br>- MANTENHA SUAS CHAVES SEGURAS<br>',
      footerMessage: 'Recomendamos usar a Hive Keychain em TODOS os sites e aplicativos Hive.',
    },
    ES: {
      colors: {
        background1: '#1e1e1e',
        background2: '#333',
        foreground1: '#4caf50',
        foreground2: '#e0e0e0',
        keyBackground: '#2c2c2c',
        alertBackground: '#d32f2f',
        highlightBackground: '#2e7d32',
      },
      welcomeMessage: 'Bienvenido a Skate Hive',
      onboardedMessage: '¡Hola skater, @{createdby} te ha incorporado a la Comunidad Skate Hive!',
      keepKeysSafeMessage: 'Aquí tienes los detalles de tu usuario y tus claves. ¡Recuerda no compartir tus claves y mantenerlas siempre seguras!',
      usernameLabel: 'Nombre de usuario',
      masterPasswordLabel: 'Contraseña Maestra',
      importKeysMessage: 'Cuando inicies sesión con la Contraseña Maestra, se importarán tus claves de Publicación, Activa y Memo.',
      ownerKeyLabel: 'Clave Privada Owner',
      activeKeyLabel: 'Clave Privada Active',
      postingKeyLabel: 'Clave Privada Posting',
      memoKeyLabel: 'Clave Privada Memo',
      importantMessage: 'IMPORTANTE: ¡Ten mucho cuidado al usar tus claves en cualquier otro sitio web o aplicación que no utilice una keychain!',
      keysDescriptionTitle: 'DESCRIPCIÓN DE LAS CLAVES',
      postingKeyDescription: 'Publicar, Comentar, Votar, Rebloguear, Seguir, Perfil',
      activeKeyDescription: 'Gestión de Billetera y Fondos. También los atributos de la clave de publicación.',
      memoKeyDescription: 'Enviar/Ver mensajes cifrados en transferencias',
      ownerKeyDescription: 'Cambiar Contraseña, Cambiar Claves, Recuperar Cuenta',
      keysRulesTitle: '5 reglas de las claves:',
      keysRules: '- NO PIERDAS TUS CLAVES<br>- NO PIERDAS TUS CLAVES<br>- NO PIERDAS TUS CLAVES<br>- NO COMPARTAS TUS CLAVES<br>- MANTÉN TUS CLAVES SEGURAS<br>',
      footerMessage: 'Recomendamos usar Hive Keychain en TODOS los sitios y aplicaciones de Hive.',
    },
  };

  // Fallback to English if the requested language doesn't exist
  return strings[language] || strings.EN;
}
