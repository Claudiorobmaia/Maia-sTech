import { supabase } from "./supabase"

const VISITOR_TOKEN_KEY =
  "maias_tech_chat_visitor_token"

const CONVERSATION_ID_KEY =
  "maias_tech_chat_conversation_id"

export type ChatMessage = {
  id: number
  sender: "visitor" | "ai" | "admin"
  content: string
  created_at: string
}

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

export function getStoredConversationId() {
  return localStorage.getItem(
    CONVERSATION_ID_KEY,
  )
}

async function createConversation() {
  const visitorToken =
    getVisitorToken()

  const { data, error } =
    await supabase.rpc(
      "create_chat_conversation",
      {
        p_visitor_token:
          visitorToken,
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

  localStorage.setItem(
    CONVERSATION_ID_KEY,
    conversationId,
  )

  return conversationId
}

async function reopenConversationIfClosed(
  conversationId: string,
  visitorToken: string,
) {
  const {
    data,
    error,
  } =
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

export async function sendVisitorMessage(
  content: string,
) {
  const visitorToken =
    getVisitorToken()

  let conversationId =
    getStoredConversationId()

  if (!conversationId) {
    conversationId =
      await createConversation()
  } else {
    /*
     * Se a conversa existente estiver
     * encerrada, reabre antes de salvar
     * a nova mensagem.
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
          content,
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

export function createChatChannel(
  conversationId: string,
) {
  return supabase.channel(
    `conversation:${conversationId}`,
  )
}

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