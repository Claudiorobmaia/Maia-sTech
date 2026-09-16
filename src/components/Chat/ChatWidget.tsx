import {
  useEffect,
  useRef,
  useState,
} from "react"

import type { RealtimeChannel } from "@supabase/supabase-js"

import {
  getChatMessages,
  getStoredConversationId,
  getStoredVisitorName,
  requestAIResponse,
  sendVisitorMessage,
  storeVisitorName,
  updateVisitorName,
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

  /*
   * Nome digitado no formulário
   * de identificação.
   */
  const [
    visitorNameInput,
    setVisitorNameInput,
  ] = useState("")

  /*
   * Nome confirmado do visitante.
   */
  const [
    visitorName,
    setVisitorName,
  ] = useState(
    () =>
      getStoredVisitorName() ?? "",
  )

  /*
   * O visitante só é considerado
   * identificado quando existe:
   *
   * 1. conversa salva
   * 2. nome salvo
   *
   * Portanto, conversas antigas que
   * possuem ID mas não possuem nome
   * voltarão a pedir identificação.
   */
  const [
    visitorIdentified,
    setVisitorIdentified,
  ] = useState(() => {
    const storedConversationId =
      getStoredConversationId()

    const storedVisitorName =
      getStoredVisitorName()

    return Boolean(
      storedConversationId &&
      storedVisitorName?.trim(),
    )
  })

  const [
    identifying,
    setIdentifying,
  ] = useState(false)

  const [
    identificationError,
    setIdentificationError,
  ] = useState("")

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

  const nameInputRef =
    useRef<HTMLInputElement | null>(
      null,
    )

  const channelRef =
    useRef<RealtimeChannel | null>(
      null,
    )

  /*
   * Carrega mensagens somente se
   * existir uma conversa.
   */
  useEffect(() => {
    async function loadMessages() {
      const storedConversationId =
        getStoredConversationId()

      if (!storedConversationId) {
        setMessages([])
        return
      }

      const data =
        await getChatMessages()

      setMessages(data)
    }

    loadMessages()
  }, [])

  /*
   * Permite que outras partes do site
   * abram o chat.
   */
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

  /*
   * Realtime da conversa.
   */
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

  /*
   * Mantém o chat rolado para
   * a mensagem mais recente.
   */
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

  /*
   * Foco automático.
   *
   * Se ainda não sabemos quem é
   * o visitante, foco no nome.
   *
   * Se já está identificado,
   * foco na mensagem.
   */
  useEffect(() => {
    if (
      !open ||
      sending ||
      identifying
    ) {
      return
    }

    const timeout =
      setTimeout(() => {
        if (!visitorIdentified) {
          nameInputRef.current?.focus()
        } else {
          inputRef.current?.focus()
        }
      }, 0)

    return () => {
      clearTimeout(timeout)
    }
  }, [
    open,
    sending,
    identifying,
    visitorIdentified,
  ])

  /*
   * Mensagem de erro exibida
   * dentro do próprio chat.
   */
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

  /*
   * Identificação do visitante.
   *
   * Existem dois cenários:
   *
   * A) conversa antiga sem nome
   *    → atualiza a conversa existente
   *
   * B) visitante novo
   *    → guarda o nome
   *      e a conversa será criada
   *      quando ele mandar a primeira
   *      mensagem
   */
  async function handleIdentifyVisitor(
    event:
      React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    const normalizedName =
      visitorNameInput.trim()

    if (
      !normalizedName ||
      identifying
    ) {
      return
    }

    setIdentifying(true)
    setIdentificationError("")

    try {
      const storedConversationId =
        getStoredConversationId()

      if (storedConversationId) {
        /*
         * Conversa antiga:
         * atualiza visitor_name
         * no Supabase.
         */
        await updateVisitorName(
          normalizedName,
        )
      } else {
        /*
         * Visitante novo:
         * ainda não existe conversa.
         *
         * Apenas guardamos o nome.
         */
        storeVisitorName(
          normalizedName,
        )
      }

      setVisitorName(
        normalizedName,
      )

      setVisitorIdentified(
        true,
      )

      /*
       * updateVisitorName pode detectar
       * que a conversa antiga foi
       * excluída pelo Admin.
       *
       * Nesse caso o ID terá sido
       * removido do localStorage.
       */
      setConversationId(
        getStoredConversationId(),
      )

      setVisitorNameInput("")
    } catch (error) {
      console.error(
        "Erro ao identificar visitante:",
        error,
      )

      setIdentificationError(
        "Não foi possível salvar seu nome. Tente novamente.",
      )
    } finally {
      setIdentifying(false)
    }
  }

  /*
   * Envio da mensagem.
   */
  async function handleSend(
    event:
      React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    const content =
      message.trim()

    if (
      !content ||
      sending ||
      !visitorIdentified ||
      !visitorName.trim()
    ) {
      return
    }

    setSending(true)

    try {
      /*
       * sendVisitorMessage verifica
       * automaticamente se a conversa
       * ainda existe.
       *
       * Se o Admin tiver excluído,
       * uma nova conversa será criada
       * usando visitorName.
       */
      const currentConversationId =
        await sendVisitorMessage(
          content,
          visitorName,
        )

      /*
       * Muito importante:
       *
       * Se uma nova conversa tiver sido
       * criada, atualizamos o state.
       *
       * Isso também faz o useEffect do
       * Realtime conectar no novo ID.
       */
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

          {!visitorIdentified ? (
            /*
             * =========================
             * IDENTIFICAÇÃO
             * =========================
             */
            <div className="chat-identification">

              <div className="chat-message assistant">
                <p>
                  Olá! 👋
                </p>

                <p>
                  Antes de começarmos,
                  como podemos chamar você?
                </p>
              </div>

              <form
                className="chat-identification-form"
                onSubmit={
                  handleIdentifyVisitor
                }
              >
                <label htmlFor="chat-visitor-name">
                  Seu nome
                </label>

                <input
                  ref={nameInputRef}
                  id="chat-visitor-name"
                  type="text"
                  value={
                    visitorNameInput
                  }
                  onChange={(event) => {
                    setVisitorNameInput(
                      event.target.value,
                    )

                    if (
                      identificationError
                    ) {
                      setIdentificationError(
                        "",
                      )
                    }
                  }}
                  placeholder="Digite seu nome"
                  autoComplete="name"
                  maxLength={80}
                  disabled={
                    identifying
                  }
                />

                {identificationError && (
                  <p className="chat-identification-error">
                    {identificationError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={
                    identifying ||
                    !visitorNameInput.trim()
                  }
                >
                  {identifying
                    ? "Salvando..."
                    : "Iniciar conversa"}
                </button>
              </form>

            </div>
          ) : (
            /*
             * =========================
             * CONVERSA
             * =========================
             */
            <>
              <div className="chat-widget-body">

                <div className="chat-message assistant">
                  <p>
                    Olá, {visitorName}! 👋
                  </p>

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
                  disabled={
                    sending ||
                    !message.trim()
                  }
                >
                  {sending
                    ? "..."
                    : "Enviar"}
                </button>
              </form>
            </>
          )}

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