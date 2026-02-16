import { Resend } from 'resend'
import type { SendEmailResult } from '@/lib/types'

const DEFAULT_EMAIL_FROM = process.env.EMAIL_FROM ?? 'PrimeUrban <contato@primeurban.com.br>'
const SIMULATED_EMAIL_ID = 'simulated-id'
let resendClient: Resend | null | undefined

interface SendEmailOptions {
  to: string | string[]
  subject: string
  html: string
  from?: string
}

const getResendClient = (): Resend | null => {
  if (resendClient !== undefined) {
    return resendClient
  }

  const apiKey = process.env.RESEND_API_KEY?.trim()
  if (!apiKey) {
    resendClient = null
    return resendClient
  }

  resendClient = new Resend(apiKey)
  return resendClient
}

/**
 * Envia um e-mail utilizando o serviço Resend.
 * O remetente padrão é configurado via variável de ambiente ou fallback.
 */
export async function sendEmail({
  to,
  subject,
  html,
  from = DEFAULT_EMAIL_FROM,
}: SendEmailOptions): Promise<SendEmailResult> {
  const client = getResendClient()

  if (!client) {
    console.warn('RESEND_API_KEY não configurada. E-mail simulado no console.')
    console.log('--- EMAIL SIMULADO ---')
    console.log(`Para: ${to}`)
    console.log(`Assunto: ${subject}`)
    console.log('----------------------')
    return { id: SIMULATED_EMAIL_ID, error: null }
  }

  try {
    const { data, error } = await client.emails.send({
      from,
      to,
      subject,
      html,
    })

    if (error) {
      const resendError =
        error instanceof Error ? error : new Error(typeof error === 'string' ? error : 'Erro no Resend')
      console.error('Erro no Resend:', error)
      return { id: null, error: resendError }
    }

    const id = data?.id ?? null
    return { id, error: null }
  } catch (err: unknown) {
    const mappedError = err instanceof Error ? err : new Error('Falha desconhecida no envio de e-mail')
    console.error('Falha no envio de e-mail:', mappedError)
    return { id: null, error: mappedError }
  }
}
