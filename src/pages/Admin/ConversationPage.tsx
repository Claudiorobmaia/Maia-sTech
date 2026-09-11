import {
  useEffect,
  useRef,
  useState,
} from "react"

import type { RealtimeChannel } from "@supabase/supabase-js"

import {
  useNavigate,
  useParams,
} from "react-router-dom"

import { supabase } from "../../services/supabase"

import "./ConversationPage.css"

type Message = {
  id: number
  conversation_id: string
  sender:
    | "visitor"
    | "ai"
    | "admin"
  content: string
  created_at: string
}

type Conversation = {
  id: string
  visitor_name: string | null
  visitor_email: string | null
  status:
    | "open"
    | "waiting"
    | "closed"
  assigned_to:
    | "ai"
    | "human"
  created_at: string
  updated_at: string
}

function ConversationPage() {
  const { id } = useParams()

  const navigate =
    useNavigate()

  const [
    conversation,
    setConversation,
  ] =
    useState<Conversation | null>(
      null,
    )

  const [
    messages,
    setMessages,
  ] =
    useState<Message[]>([])

  const [reply, setReply] =
    useState("")

  const [loading, setLoading] =
    useState(true)

  const [sending, setSending] =
    useState(false)

  const [closing, setClosing] =
    useState(false)

  const messagesEndRef =
    useRef<HTMLDivElement | null>(
      null,
    )

  const channelRef =
    useRef<RealtimeChannel | null>(
      null,
    )

  useEffect(() => {
    if (!id) {
      return
    }

    loadConversation()
  }, [id])

  useEffect(() => {
    if (!id) {
      return
    }

    const channel =
      supabase.channel(
        `conversation:${id}`,
      )

    channel
      .on(
        "broadcast",
        {
          event: "new-message",
        },
        () => {
          loadConversation()
        },
      )
      .subscribe((status) => {
        console.log(
          "Realtime admin:",
          status,
        )
      })

    channelRef.current =
      channel

    return () => {
      supabase.removeChannel(
        channel,
      )

      channelRef.current =
        null
    }
  }, [id])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    })
  }, [messages])

  async function loadConversation() {
    if (!id) {
      return
    }

    const {
      data: conversationData,
      error: conversationError,
    } =
      await supabase
        .from("conversations")
        .select(`
          id,
          visitor_name,
          visitor_email,
          status,
          assigned_to,
          created_at,
          updated_at
        `)
        .eq("id", id)
        .single()

    if (conversationError) {
      console.error(
        "Erro ao carregar conversa:",
        conversationError,
      )

      setLoading(false)
      return
    }

    const {
      data: messagesData,
      error: messagesError,
    } =
      await supabase
        .from("messages")
        .select(`
          id,
          conversation_id,
          sender,
          content,
          created_at
        `)
        .eq(
          "conversation_id",
          id,
        )
        .order("created_at", {
          ascending: true,
        })

    if (messagesError) {
      console.error(
        "Erro ao carregar mensagens:",
        messagesError,
      )

      setLoading(false)
      return
    }

    setConversation(
      conversationData as Conversation,
    )

    setMessages(
      (messagesData ??
        []) as Message[],
    )

    setLoading(false)
  }

  async function changeAssignedTo(
    assignedTo: "ai" | "human",
  ) {
    if (!id) return

    const { error } = await supabase
      .from("conversations")
      .update({
        assigned_to: assignedTo,
        updated_at:
          new Date().toISOString(),
      })
      .eq("id", id)

    if (error) {
      console.error(
        "Erro ao alterar atendimento:",
        error,
      )

      alert(
        "Não foi possível alterar o atendimento.",
      )

      return
    }

    setConversation((current) => {
      if (!current) return current

      return {
        ...current,
        assigned_to: assignedTo,
        updated_at:
          new Date().toISOString(),
      }
    })
  }

  async function closeConversation() {
    if (
      !id ||
      !conversation ||
      closing
    ) {
      return
    }

    const confirmed =
      window.confirm(
        "Deseja realmente encerrar esta conversa?",
      )

    if (!confirmed) {
      return
    }

    setClosing(true)

    const now =
      new Date().toISOString()

    const { error } =
      await supabase
        .from("conversations")
        .update({
          status: "closed",
          updated_at: now,
        })
        .eq("id", id)

    if (error) {
      console.error(
        "Erro ao encerrar conversa:",
        error,
      )

      alert(
        "Não foi possível encerrar a conversa.",
      )

      setClosing(false)
      return
    }

    setConversation((current) => {
      if (!current) {
        return current
      }

      return {
        ...current,
        status: "closed",
        updated_at: now,
      }
    })

    setClosing(false)
  }

  async function handleSend(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    if (!id) {
      return
    }

    const content =
      reply.trim()

    if (
      !content ||
      sending ||
      conversation?.status === "closed"
    ) {
      return
    }

    setSending(true)

    const {
      data,
      error,
    } =
      await supabase
        .from("messages")
        .insert({
          conversation_id:
            id,

          sender: "admin",

          content,
        })
        .select(`
          id,
          conversation_id,
          sender,
          content,
          created_at
        `)
        .single()

    if (error) {
      console.error(
        "Erro ao enviar resposta:",
        error,
      )

      alert(
        "Não foi possível enviar a resposta.",
      )

      setSending(false)
      return
    }

    const now =
      new Date().toISOString()

    const {
      error:
        conversationUpdateError,
    } =
      await supabase
        .from("conversations")
        .update({
          assigned_to:
            "human",

          status: "open",

          updated_at:
            now,
        })
        .eq("id", id)

    if (
      conversationUpdateError
    ) {
      console.error(
        "Erro ao atualizar conversa após resposta:",
        conversationUpdateError,
      )
    } else {
      setConversation(
        (current) => {
          if (!current) {
            return current
          }

          return {
            ...current,
            assigned_to:
              "human",
            status: "open",
            updated_at:
              now,
          }
        },
      )
    }

    setMessages(
      (current) => [
        ...current,
        data as Message,
      ],
    )

    setReply("")

    const channel =
      channelRef.current

    if (channel) {
      await channel.send({
        type: "broadcast",
        event: "new-message",
        payload: {
          sender: "admin",
        },
      })
    }

    setSending(false)
  }

  function formatDate(
    value: string,
  ) {
    return new Intl.DateTimeFormat(
      "pt-BR",
      {
        dateStyle: "short",
        timeStyle: "short",
      },
    ).format(
      new Date(value),
    )
  }

  if (loading) {
    return (
      <main className="conversation-page">
        <div className="conversation-loading">
          Carregando conversa...
        </div>
      </main>
    )
  }

  if (!conversation) {
    return (
      <main className="conversation-page">
        <div className="conversation-loading">
          Conversa não encontrada.
        </div>
      </main>
    )
  }

  return (
    <main className="conversation-page">

      <section className="conversation-panel">

        <header className="conversation-header">

          <div>

            <button
              type="button"
              className="conversation-back"
              onClick={() =>
                navigate(
                  "/admin/mensagens",
                )
              }
            >
              ← Conversas
            </button>

            <h1>
              {conversation.visitor_name ||
                "Visitante"}
            </h1>

            <span>
              {conversation.visitor_email ||
                "Sem e-mail informado"}
            </span>

          </div>

          <div className="conversation-header-status">

            <span
              className={`conversation-status ${conversation.status}`}
            >
              {conversation.status}
            </span>

            <div className="conversation-assignment">
              <span>
                Atendimento:
              </span>

              <div className="conversation-assignment-buttons">
                <button
                  type="button"
                  className={
                    conversation.assigned_to === "ai"
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    changeAssignedTo(
                      "ai",
                    )
                  }
                  disabled={
                    conversation.status ===
                    "closed"
                  }
                >
                  🤖 IA
                </button>

                <button
                  type="button"
                  className={
                    conversation.assigned_to === "human"
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    changeAssignedTo(
                      "human",
                    )
                  }
                  disabled={
                    conversation.status ===
                    "closed"
                  }
                >
                  👤 Humano
                </button>
              </div>
            </div>

            {conversation.status !==
              "closed" && (
              <button
                type="button"
                className="conversation-close-button"
                onClick={
                  closeConversation
                }
                disabled={closing}
              >
                {closing
                  ? "Encerrando..."
                  : "Encerrar conversa"}
              </button>
            )}

            <small>
              {formatDate(
                conversation.updated_at,
              )}
            </small>

          </div>

        </header>

        <div className="conversation-messages">

          {messages.length === 0 ? (

            <p className="conversation-empty">
              Nenhuma mensagem nesta conversa.
            </p>

          ) : (

            messages.map(
              (message) => (

                <div
                  key={message.id}
                  className={`conversation-message ${message.sender}`}
                >

                  <span>
                    {message.sender ===
                    "visitor"
                      ? "Visitante"
                      : message.sender ===
                          "ai"
                        ? "Assistente IA"
                        : "MAIA'S TECH"}
                  </span>

                  <p>
                    {
                      message.content
                    }
                  </p>

                  <small>
                    {formatDate(
                      message.created_at,
                    )}
                  </small>

                </div>

              ),
            )

          )}

          <div
            ref={messagesEndRef}
          />

        </div>

        {conversation.status ===
        "closed" ? (
          <div className="conversation-closed-notice">
            Esta conversa foi encerrada.
          </div>
        ) : (
          <form
            className="conversation-reply"
            onSubmit={handleSend}
          >

            <input
              type="text"
              value={reply}
              onChange={(event) =>
                setReply(
                  event.target.value,
                )
              }
              placeholder="Digite sua resposta..."
              disabled={sending}
            />

            <button
              type="submit"
              disabled={
                sending ||
                !reply.trim()
              }
            >
              {sending
                ? "Enviando..."
                : "Enviar"}
            </button>

          </form>
        )}

      </section>

    </main>
  )
}

export default ConversationPage