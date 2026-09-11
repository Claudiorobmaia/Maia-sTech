import {
  useEffect,
  useMemo,
  useState,
} from "react"

import { useNavigate } from "react-router-dom"

import { supabase } from "../../services/supabase"

import "./MessagesPage.css"

type Conversation = {
  id: string
  visitor_name: string | null
  visitor_email: string | null
  status: "open" | "waiting" | "closed"
  assigned_to: "ai" | "human"
  created_at: string
  updated_at: string
}

type ConversationFilter =
  | "all"
  | "waiting"
  | "active"
  | "ai"
  | "closed"

function MessagesPage() {
  const navigate = useNavigate()

  const [conversations, setConversations] =
    useState<Conversation[]>([])

  const [loading, setLoading] =
    useState(true)

  const [activeFilter, setActiveFilter] =
    useState<ConversationFilter>("all")

  const [searchTerm, setSearchTerm] =
    useState("")

  const counters = useMemo(() => {
    const waiting =
      conversations.filter(
        (conversation) =>
          conversation.status === "waiting" &&
          conversation.assigned_to === "human",
      ).length

    const active =
      conversations.filter(
        (conversation) =>
          conversation.status === "open" &&
          conversation.assigned_to === "human",
      ).length

    const ai =
      conversations.filter(
        (conversation) =>
          conversation.status === "open" &&
          conversation.assigned_to === "ai",
      ).length

    const closed =
      conversations.filter(
        (conversation) =>
          conversation.status === "closed",
      ).length

    return {
      all: conversations.length,
      waiting,
      active,
      ai,
      closed,
    }
  }, [conversations])

  const waitingCount =
    counters.waiting

  const filteredConversations = useMemo(() => {
    let filtered = conversations

    if (activeFilter === "waiting") {
      filtered = filtered.filter(
        (conversation) =>
          conversation.status === "waiting" &&
          conversation.assigned_to === "human",
      )
    }

    if (activeFilter === "active") {
      filtered = filtered.filter(
        (conversation) =>
          conversation.status === "open" &&
          conversation.assigned_to === "human",
      )
    }

    if (activeFilter === "ai") {
      filtered = filtered.filter(
        (conversation) =>
          conversation.status === "open" &&
          conversation.assigned_to === "ai",
      )
    }

    if (activeFilter === "closed") {
      filtered = filtered.filter(
        (conversation) =>
          conversation.status === "closed",
      )
    }

    const normalizedSearch =
      searchTerm
        .trim()
        .toLowerCase()

    if (normalizedSearch) {
      filtered = filtered.filter(
        (conversation) => {
          const visitorName =
            conversation.visitor_name
              ?.toLowerCase() ?? ""

          const visitorEmail =
            conversation.visitor_email
              ?.toLowerCase() ?? ""

          return (
            visitorName.includes(
              normalizedSearch,
            ) ||
            visitorEmail.includes(
              normalizedSearch,
            )
          )
        },
      )
    }

    return [...filtered].sort(
      (conversationA, conversationB) => {
        const aWaiting =
          conversationA.status === "waiting" &&
          conversationA.assigned_to === "human"

        const bWaiting =
          conversationB.status === "waiting" &&
          conversationB.assigned_to === "human"

        if (aWaiting && !bWaiting) {
          return -1
        }

        if (!aWaiting && bWaiting) {
          return 1
        }

        return (
          new Date(
            conversationB.updated_at,
          ).getTime() -
          new Date(
            conversationA.updated_at,
          ).getTime()
        )
      },
    )
  }, [
    conversations,
    activeFilter,
    searchTerm,
  ])

  useEffect(() => {
    loadConversations()

    const channel = supabase
      .channel("admin-conversations-list")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "conversations",
        },
        () => {
          loadConversations(false)
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  async function loadConversations(
    showLoading = true,
  ) {
    if (showLoading) {
      setLoading(true)
    }

    const { data, error } =
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
        .order("updated_at", {
          ascending: false,
        })

    if (error) {
      console.error(
        "Erro ao carregar conversas:",
        error,
      )

      if (showLoading) {
        setConversations([])
      }

      setLoading(false)
      return
    }

    setConversations(
      (data ?? []) as Conversation[],
    )

    setLoading(false)
  }

  function formatDate(value: string) {
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

  function getStatusLabel(
    conversation: Conversation,
  ) {
    if (
      conversation.status === "waiting" &&
      conversation.assigned_to === "human"
    ) {
      return "Aguardando atendente"
    }

    if (conversation.status === "open") {
      return conversation.assigned_to === "human"
        ? "Atendimento humano"
        : "Atendimento IA"
    }

    if (conversation.status === "closed") {
      return "Encerrada"
    }

    return conversation.status
  }

  function isWaitingForHuman(
    conversation: Conversation,
  ) {
    return (
      conversation.status === "waiting" &&
      conversation.assigned_to === "human"
    )
  }

  return (
    <main className="admin-messages-page">
      <div className="admin-messages-container">

        <div className="admin-messages-heading">
          <div>
            <span>
              MAIA'S TECH ADMIN
            </span>

            <div className="admin-messages-title-row">
              <h1>Mensagens</h1>

              {waitingCount > 0 && (
                <div className="admin-waiting-counter">
                  <span className="admin-waiting-dot" />

                  {waitingCount === 1
                    ? "1 cliente aguardando"
                    : `${waitingCount} clientes aguardando`}
                </div>
              )}
            </div>

            <p>
              Acompanhe as conversas iniciadas
              pelos visitantes do site.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate("/admin")
            }
          >
            ← Voltar ao painel
          </button>
        </div>

        <div className="admin-conversation-search">
          <span
            className="admin-conversation-search-icon"
            aria-hidden="true"
          >
            ⌕
          </span>

          <input
            type="search"
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(
                event.target.value,
              )
            }
            placeholder="Buscar por nome ou e-mail..."
            aria-label="Buscar conversa por nome ou e-mail"
          />

          {searchTerm && (
            <button
              type="button"
              className="admin-conversation-search-clear"
              onClick={() =>
                setSearchTerm("")
              }
              aria-label="Limpar busca"
            >
              ×
            </button>
          )}
        </div>

        <div className="admin-conversation-filters">

          <button
            type="button"
            className={
              activeFilter === "all"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveFilter("all")
            }
          >
            Todas

            <span className="admin-filter-count">
              {counters.all}
            </span>
          </button>

          <button
            type="button"
            className={
              activeFilter === "waiting"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveFilter("waiting")
            }
          >
            Aguardando

            <span className="admin-filter-count">
              {counters.waiting}
            </span>
          </button>

          <button
            type="button"
            className={
              activeFilter === "active"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveFilter("active")
            }
          >
            Em atendimento

            <span className="admin-filter-count">
              {counters.active}
            </span>
          </button>

          <button
            type="button"
            className={
              activeFilter === "ai"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveFilter("ai")
            }
          >
            IA

            <span className="admin-filter-count">
              {counters.ai}
            </span>
          </button>

          <button
            type="button"
            className={
              activeFilter === "closed"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveFilter("closed")
            }
          >
            Encerradas

            <span className="admin-filter-count">
              {counters.closed}
            </span>
          </button>

        </div>

        {loading ? (
          <div className="admin-messages-status">
            Carregando conversas...
          </div>
        ) : conversations.length === 0 ? (
          <div className="admin-messages-status">
            Nenhuma conversa encontrada.
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="admin-messages-status">
            Nenhuma conversa corresponde à busca
            ou filtro selecionado.
          </div>
        ) : (
          <div className="admin-conversations-list">

            {filteredConversations.map(
              (conversation) => {
                const waiting =
                  isWaitingForHuman(
                    conversation,
                  )

                return (
                  <button
                    className={`admin-conversation-card ${
                      waiting
                        ? "waiting-human"
                        : ""
                    }`}
                    key={conversation.id}
                    type="button"
                    onClick={() =>
                      navigate(
                        `/admin/mensagens/${conversation.id}`,
                      )
                    }
                  >

                    <div className="admin-conversation-main">

                      <div className="admin-conversation-avatar">
                        M
                      </div>

                      <div>
                        <strong>
                          {conversation.visitor_name ||
                            "Visitante"}
                        </strong>

                        <span>
                          {conversation.visitor_email ||
                            "Sem e-mail informado"}
                        </span>

                        {waiting && (
                          <span className="admin-human-request">
                            Cliente solicitou atendimento humano
                          </span>
                        )}
                      </div>

                    </div>

                    <div className="admin-conversation-meta">

                      <span
                        className={`conversation-status ${conversation.status}`}
                      >
                        {waiting && (
                          <span className="conversation-status-dot" />
                        )}

                        {getStatusLabel(
                          conversation,
                        )}
                      </span>

                      <small>
                        {formatDate(
                          conversation.updated_at,
                        )}
                      </small>

                    </div>

                  </button>
                )
              },
            )}

          </div>
        )}

      </div>
    </main>
  )
}

export default MessagesPage