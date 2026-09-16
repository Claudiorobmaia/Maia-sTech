import { supabase } from "./supabase"

const VISITOR_TOKEN_KEY =
  "maias_tech_chat_visitor_token"

const CONVERSATION_ID_KEY =
  "maias_tech_chat_conversation_id"

export const VISITOR_NAME_KEY =
  "maias_tech_chat_visitor_name"

export type ChatMessage = {
  id: number
  sender: "visitor" | "ai" | "admin"
  content: string
  created_at: string
}

/*
 * Retorna o token do visitante.
 * Se ainda não existir, cria um.
 */
function getVisitorToken() {
  let token = localStorage.getItem(
    VISITOR_TOKEN_KEY,
  )

  if (!token) {
    token = crypto.randomUUID()

    localStorage.setItem(
      VISITOR_TOKEN_KEY,
      token,
    )
  }

  return token
}

/*
 * Retorna o ID da conversa salvo
 * no navegador.
 */
export function getStoredConversationId() {
  return localStorage.getItem(
    CONVERSATION_ID_KEY,
  )
}

/*
 * Retorna o nome salvo no navegador.
 */
export function getStoredVisitorName() {
  return localStorage.getItem(
    VISITOR_NAME_KEY,
  )
}

/*
 * Salva o nome do visitante.
 */
export function storeVisitorName(
  visitorName: string,
) {
  const normalizedName =
    visitorName.trim()

  if (!normalizedName) {
    return
  }

  localStorage.setItem(
    VISITOR_NAME_KEY,
    normalizedName,
  )
}

/*
 * Remove somente o ID da conversa.
 *
 * Mantemos o nome e o token porque,
 * se o Admin excluir a conversa,
 * poderemos criar outra automaticamente
 * para a mesma pessoa.
 */
function clearStoredConversationId() {
  localStorage.removeItem(
    CONVERSATION_ID_KEY,
  )
}

/*
 * Cria uma nova conversa.
 */
async function createConversation(
  visitorName: string,
) {
  const visitorToken =
    getVisitorToken()

  const normalizedVisitorName =
    visitorName.trim()

  if (!normalizedVisitorName) {
    throw new Error(
      "O nome do visitante é obrigatório.",
    )
  }

  const { data, error } =
    await supabase.rpc(
      "create_chat_conversation",
      {
        p_visitor_token:
          visitorToken,

        p_visitor_name:
          normalizedVisitorName,
      },
    )

  if (error) {
    console.error(
      "Erro ao criar conversa:",
      error,
    )

    throw error
  }

  const conversationId =
    data as string

  if (!conversationId) {
    throw new Error(
      "O Supabase não retornou o ID da conversa.",
    )
  }

  localStorage.setItem(
    CONVERSATION_ID_KEY,
    conversationId,
  )

  storeVisitorName(
    normalizedVisitorName,
  )

  return conversationId
}

/*
 * Verifica se uma conversa ainda existe.
 *
 * Isso é usado quando o Admin excluiu
 * uma conversa, mas o navegador do
 * visitante ainda guarda o ID antigo.
 */
async function conversationExists(
  conversationId: string,
) {
  const { data, error } =
    await supabase
      .from("conversations")
      .select("id")
      .eq(
        "id",
        conversationId,
      )
      .maybeSingle()

  if (error) {
    console.error(
      "Erro ao verificar conversa:",
      error,
    )

    throw error
  }

  return Boolean(data)
}

/*
 * Atualiza o nome de uma conversa antiga.
 *
 * A função do Supabase valida:
 *
 * conversation_id + visitor_token
 *
 * antes de permitir a alteração.
 */
export async function updateVisitorName(
  visitorName: string,
) {
  const normalizedVisitorName =
    visitorName.trim()

  if (!normalizedVisitorName) {
    throw new Error(
      "O nome do visitante é obrigatório.",
    )
  }

  const conversationId =
    getStoredConversationId()

  /*
   * Se não existe conversa ainda,
   * apenas guardamos o nome.
   *
   * Ele será usado quando a primeira
   * mensagem criar a conversa.
   */
  if (!conversationId) {
    storeVisitorName(
      normalizedVisitorName,
    )

    return true
  }

  const visitorToken =
    getVisitorToken()

  /*
   * Antes de atualizar, verificamos se
   * aquela conversa ainda existe.
   */
  const exists =
    await conversationExists(
      conversationId,
    )

  /*
   * Se o Admin já excluiu a conversa,
   * não existe mais nada para atualizar.
   *
   * Guardamos o nome e removemos apenas
   * o ID antigo. A próxima mensagem
   * criará uma nova conversa.
   */
  if (!exists) {
    clearStoredConversationId()

    storeVisitorName(
      normalizedVisitorName,
    )

    return true
  }

  const { data, error } =
    await supabase.rpc(
      "update_chat_visitor_name",
      {
        p_conversation_id:
          conversationId,

        p_visitor_token:
          visitorToken,

        p_visitor_name:
          normalizedVisitorName,
      },
    )

  if (error) {
    console.error(
      "Erro ao atualizar nome do visitante:",
      error,
    )

    throw error
  }

  if (data !== true) {
    throw new Error(
      "Não foi possível atualizar o nome da conversa.",
    )
  }

  /*
   * Só salvamos localmente depois
   * que o Supabase confirmou.
   */
  storeVisitorName(
    normalizedVisitorName,
  )

  return true
}

/*
 * Reabre uma conversa encerrada.
 */
async function reopenConversationIfClosed(
  conversationId: string,
  visitorToken: string,
) {
  const { data, error } =
    await supabase.rpc(
      "reopen_chat_conversation",
      {
        p_conversation_id:
          conversationId,

        p_visitor_token:
          visitorToken,
      },
    )

  if (error) {
    console.error(
      "Erro ao verificar/reabrir conversa:",
      error,
    )

    throw error
  }

  if (data === true) {
    console.log(
      "Conversa reaberta automaticamente e devolvida para a IA.",
    )
  }

  return data === true
}

/*
 * Envia uma mensagem.
 *
 * Também trata automaticamente uma
 * conversa que tenha sido excluída
 * pelo Admin.
 */
export async function sendVisitorMessage(
  content: string,
  visitorName: string,
) {
  const normalizedContent =
    content.trim()

  const normalizedVisitorName =
    visitorName.trim()

  if (!normalizedContent) {
    throw new Error(
      "A mensagem não pode estar vazia.",
    )
  }

  if (!normalizedVisitorName) {
    throw new Error(
      "O nome do visitante é obrigatório.",
    )
  }

  const visitorToken =
    getVisitorToken()

  let conversationId =
    getStoredConversationId()

  /*
   * Se existe um ID salvo, verificamos
   * se a conversa ainda existe.
   */
  if (conversationId) {
    const exists =
      await conversationExists(
        conversationId,
      )

    /*
     * Se o Admin excluiu a conversa,
     * descartamos somente o ID antigo.
     */
    if (!exists) {
      console.log(
        "Conversa anterior não existe mais. Uma nova será criada.",
      )

      clearStoredConversationId()

      conversationId = null
    }
  }

  /*
   * Sem conversa válida:
   * cria uma nova com o mesmo nome.
   */
  if (!conversationId) {
    conversationId =
      await createConversation(
        normalizedVisitorName,
      )
  } else {
    /*
     * Se existe, mas está encerrada,
     * reabre antes de enviar.
     */
    await reopenConversationIfClosed(
      conversationId,
      visitorToken,
    )
  }

  const { error } =
    await supabase.rpc(
      "send_chat_message",
      {
        p_conversation_id:
          conversationId,

        p_visitor_token:
          visitorToken,

        p_content:
          normalizedContent,
      },
    )

  if (error) {
    console.error(
      "Erro ao enviar mensagem:",
      error,
    )

    throw error
  }

  return conversationId
}

/*
 * Solicita resposta automática da IA.
 */
export async function requestAIResponse(
  conversationId: string,
  content: string,
) {
  const visitorToken =
    getVisitorToken()

  const { data, error } =
    await supabase.functions.invoke(
      "chat-ai",
      {
        body: {
          conversationId,
          visitorToken,
          message: content,
        },
      },
    )

  if (error) {
    console.error(
      "Erro ao gerar resposta da IA:",
      error,
    )

    throw error
  }

  console.log(
    "Resposta automática da IA:",
    data,
  )

  return data
}

/*
 * Carrega as mensagens da conversa atual.
 */
export async function getChatMessages() {
  const conversationId =
    getStoredConversationId()

  const visitorToken =
    localStorage.getItem(
      VISITOR_TOKEN_KEY,
    )

  if (
    !conversationId ||
    !visitorToken
  ) {
    return []
  }

  const { data, error } =
    await supabase.rpc(
      "get_chat_messages",
      {
        p_conversation_id:
          conversationId,

        p_visitor_token:
          visitorToken,
      },
    )

  if (error) {
    console.error(
      "Erro ao carregar mensagens:",
      error,
    )

    return []
  }

  return (data ?? []) as ChatMessage[]
}

/*
 * Cria canal Realtime.
 */
export function createChatChannel(
  conversationId: string,
) {
  return supabase.channel(
    `conversation:${conversationId}`,
  )
}

/*
 * Envia aviso pelo Realtime.
 */
export async function broadcastChatMessage(
  conversationId: string,
  sender:
    | "visitor"
    | "admin"
    | "ai",
) {
  const channel =
    supabase.channel(
      `conversation:${conversationId}`,
    )

  return new Promise<void>(
    (resolve, reject) => {
      channel.subscribe(
        async (status) => {
          if (
            status ===
            "SUBSCRIBED"
          ) {
            const result =
              await channel.send({
                type: "broadcast",
                event:
                  "new-message",
                payload: {
                  conversationId,
                  sender,
                },
              })

            await supabase.removeChannel(
              channel,
            )

            if (result === "ok") {
              resolve()
            } else {
              reject(
                new Error(
                  "Não foi possível transmitir a mensagem.",
                ),
              )
            }

            return
          }

          if (
            status ===
              "CHANNEL_ERROR" ||
            status ===
              "TIMED_OUT"
          ) {
            await supabase.removeChannel(
              channel,
            )

            reject(
              new Error(
                `Erro no Realtime: ${status}`,
              ),
            )
          }
        },
      )
    },
  )
}