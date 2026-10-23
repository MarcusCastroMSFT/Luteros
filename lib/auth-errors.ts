export type AuthProvider = 'google' | 'credentials'

// Auth.js error codes (https://authjs.dev/reference/core/errors) -> messages for the user.
export function translateAuthError(code?: string | null, provider?: AuthProvider): string {
  switch (code) {
    case 'CredentialsSignin':
      return 'E-mail ou senha incorretos.'
    case 'password_not_set':
      return 'Esta conta entra com o Google. Use "Continuar com Google" ou crie uma senha em "Esqueceu sua senha?".'
    case 'email_not_verified':
      return 'Confirme seu e-mail para entrar. Abra o link que enviamos para sua caixa de entrada.'
    case 'verification_expired':
      return 'O link de confirmação expirou. Entre com seu e-mail e senha para receber um novo.'
    case 'verification_invalid':
      return 'Link de confirmação inválido ou já usado. Se o e-mail ainda não foi confirmado, entre com seu e-mail e senha para receber um novo link.'
    case 'OAuthAccountNotLinked':
      return 'Já existe uma conta com este e-mail. Entre com seu e-mail e senha ou use "Esqueceu sua senha?" para criar uma nova.'
    case 'AccessDenied':
      return 'O acesso não foi autorizado. Se você cancelou a autorização do Google, tente novamente.'
    case 'Verification':
      return 'Link de verificação inválido ou expirado.'
    case 'SessionRequired':
      return 'Entre na sua conta para continuar.'
    case 'OAuthSignin':
    case 'OAuthCallback':
    case 'OAuthCreateAccount':
      return 'Não foi possível entrar com o Google. Tente novamente.'
    case 'Callback':
      return 'Erro ao processar o login. Tente novamente.'
    case 'Configuration':
      return 'Erro de configuração do servidor. Contate o suporte.'
    default:
      return provider === 'google'
        ? 'Não foi possível entrar com o Google. Tente novamente.'
        : 'Falha ao entrar. Verifique seus dados e tente novamente.'
  }
}
