import {
  useEffect,
  useRef,
  useState,
} from "react"

import type { RealtimeChannel } from "@supabase/supabase-js"

import {
  getChatMessages,
  getStoredConversationId,
  requestAIResponse,
  sendVisitorMessage,
  type ChatMessage,
} from "../../services/chat"

import { supabase } from "../../services/supabase"

import "./ChatWidget.css"

const catalogLabels = [
  "Produto",
  "Marca",
  "Modelo",
  "Condição",
  "Preço",
  "Estoque",
]

function renderMessageContent(
  content: string,
) {
  return content
    .split("\n")
    .map((line, index) => {
      const matchedLabel =
        catalogLabels.find((label) =>
          line.startsWith(
            `${label}:`,
          ),
        )

      if (!matchedLabel) {
        return (
          <span
            className="chat-message-line"
            key={`${index}-${line}`}
          >
            {line || "\u00A0"}
          </span>
        )
      }

      const value = line
        .slice(
          matchedLabel.length + 1,
        )
        .trim()

      return (
        <span
          className="chat-message-line"
          key={`${index}-${line}`}
        >
          <span className="chat-catalog-label">
            {matchedLabel}:
          </span>{" "}
          <span className="chat-catalog-value">
            {value}
          </span>
        </span>
      )
    })
}

function ChatWidget() {
  const [open, setOpen] =
    useState(false)

  const [message, setMessage] =
    useState("")

  const [messages, setMessages] =
    useState<ChatMessage[]>([])

  const [
    conversationId,
    setConversationId,
  ] = useState<string | null>(
    getStoredConversationId(),
  )

  const [sending, setSending] =
    useState(false)

  const [aiTyping, setAiTyping] =
    useState(false)

  const messagesEndRef =
    useRef<HTMLDivElement | null>(
      null,
    )

  const inputRef =
    useRef<HTMLInputElement | null>(
      null,
    )

  const channelRef =
    useRef<RealtimeChannel | null>(
      null,
    )

  useEffect(() => {
    async function loadMessages() {
      const data =
        await getChatMessages()

      setMessages(data)
    }

    loadMessages()
  }, [])

  useEffect(() => {
    function handleOpenChat() {
      setOpen(true)
    }

    window.addEventListener(
      "maiastech:open-chat",
      handleOpenChat,
    )

    return () => {
      window.removeEventListener(
        "maiastech:open-chat",
        handleOpenChat,
      )
    }
  }, [])

  useEffect(() => {
    if (!conversationId) {
      return
    }

    const channel =
      supabase.channel(
        `conversation:${conversationId}`,
      )

    channel
      .on(
        "broadcast",
        {
          event: "new-message",
        },
        async () => {
          const updatedMessages =
            await getChatMessages()

          setMessages(
            updatedMessages,
          )
        },
      )
      .subscribe((status) => {
        console.log(
          "Realtime visitante:",
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
  }, [conversationId])

  useEffect(() => {
    if (!open) {
      return
    }

    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    })
  }, [
    messages,
    open,
    aiTyping,
  ])

  useEffect(() => {
    if (!open || sending) {
      return
    }

    const timeout =
      setTimeout(() => {
        inputRef.current?.focus()
      }, 0)

    return () => {
      clearTimeout(timeout)
    }
  }, [
    open,
    sending,
  ])

  function addLocalErrorMessage(
    content: string,
  ) {
    setMessages(
      (currentMessages) => {
        const lastMessage =
          currentMessages[
            currentMessages.length - 1
          ]

        if (
          lastMessage?.sender ===
            "ai" &&
          lastMessage.content ===
            content
        ) {
          return currentMessages
        }

        return [
          ...currentMessages,
          {
            id: Date.now(),
            sender: "ai",
            content,
            created_at:
              new Date().toISOString(),
          },
        ]
      },
    )
  }

  async function handleSend(
    event:
      React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    const content =
      message.trim()

    if (
      !content ||
      sending
    ) {
      return
    }

    setSending(true)

    try {
      const currentConversationId =
        await sendVisitorMessage(
          content,
        )

      setConversationId(
        currentConversationId,
      )

      setMessage("")

      const updatedMessages =
        await getChatMessages()

      setMessages(
        updatedMessages,
      )

      const channel =
        channelRef.current

      if (channel) {
        await channel.send({
          type: "broadcast",
          event: "new-message",
          payload: {
            sender: "visitor",
          },
        })
      }

      setSending(false)
      setAiTyping(true)

      try {
        await requestAIResponse(
          currentConversationId,
          content,
        )

        const messagesAfterAI =
          await getChatMessages()

        setMessages(
          messagesAfterAI,
        )

        const activeChannel =
          channelRef.current

        if (activeChannel) {
          await activeChannel.send({
            type: "broadcast",
            event: "new-message",
            payload: {
              sender: "ai",
            },
          })
        }
      } catch (aiError) {
        console.error(
          "Erro na resposta da IA:",
          aiError,
        )

        addLocalErrorMessage(
          "Não consegui responder agora. Tente novamente em alguns instantes ou aguarde atendimento humano.",
        )
      } finally {
        setAiTyping(false)
      }
    } catch (error) {
      console.error(
        "Erro ao enviar mensagem pelo chat:",
        error,
      )

      addLocalErrorMessage(
        "Ocorreu um problema ao enviar sua mensagem. Tente novamente em alguns instantes.",
      )

      setSending(false)
      setAiTyping(false)
    }
  }

  return (
    <>
      {open && (
        <section className="chat-widget">
          <header className="chat-widget-header">
            <div>
              <span>
                MAIA'S TECH
              </span>

              <strong>
                Atendimento
              </strong>
            </div>

            <button
              type="button"
              onClick={() =>
                setOpen(false)
              }
              aria-label="Fechar chat"
            >
              ×
            </button>
          </header>

          <div className="chat-widget-body">
            <div className="chat-message assistant">
              <p>Olá! 👋</p>

              <p>
                Como podemos ajudar?
              </p>
            </div>

            {messages.map(
              (chatMessage) => (
                <div
                  key={
                    chatMessage.id
                  }
                  className={
                    chatMessage.sender ===
                    "visitor"
                      ? "chat-message visitor"
                      : "chat-message assistant"
                  }
                >
                  <p>
                    {chatMessage.sender ===
                    "ai"
                      ? renderMessageContent(
                          chatMessage.content,
                        )
                      : chatMessage.content}
                  </p>
                </div>
              ),
            )}

            {aiTyping && (
              <div className="chat-message assistant typing">
                <span className="typing-label">
                  Assistente está digitando
                </span>

                <span
                  className="typing-dots"
                  aria-hidden="true"
                >
                  <i></i>
                  <i></i>
                  <i></i>
                </span>
              </div>
            )}

            <div
              ref={messagesEndRef}
            />
          </div>

          <form
            className="chat-widget-form"
            onSubmit={handleSend}
          >
            <input
              ref={inputRef}
              type="text"
              value={message}
              onChange={(event) =>
                setMessage(
                  event.target.value,
                )
              }
              placeholder="Digite sua mensagem..."
              disabled={sending}
            />

            <button
              type="submit"
              disabled={sending}
            >
              {sending
                ? "..."
                : "Enviar"}
            </button>
          </form>
        </section>
      )}

      <button
        className="chat-floating-button"
        type="button"
        onClick={() =>
          setOpen(
            (current) =>
              !current,
          )
        }
        aria-label="Abrir chat"
      >
        Chat
      </button>
    </>
  )
}

export default ChatWidget