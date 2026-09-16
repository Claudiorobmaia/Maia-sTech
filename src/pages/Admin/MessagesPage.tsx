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

  const [
    deletingConversationId,
    setDeletingConversationId,
  ] = useState<string | null>(null)

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

  async function handleDeleteConversation(
    conversation: Conversation,
  ) {
    if (deletingConversationId) {
      return
    }

    const visitorName =
      conversation.visitor_name ||
      "Visitante"

    const confirmed =
      window.confirm(
        `Excluir conversa?\n\nDeseja realmente excluir a conversa de ${visitorName}?\n\nTodas as mensagens dessa conversa também serão excluídas.\n\nEssa ação não poderá ser desfeita.`,
      )

    if (!confirmed) {
      return
    }

    setDeletingConversationId(
      conversation.id,
    )

    try {
      /*
       * O .select("id") é importante.
       *
       * Assim não consideramos a operação
       * concluída apenas porque o Supabase
       * não retornou um erro.
       *
       * Precisamos receber o ID da linha
       * que realmente foi excluída.
       */
      const { data, error } =
        await supabase
          .from("conversations")
          .delete()
          .eq(
            "id",
            conversation.id,
          )
          .select("id")

      if (error) {
        throw error
      }

      /*
       * Se nenhuma linha voltou,
       * significa que a conversa não foi
       * realmente excluída do banco.
       */
      if (
        !data ||
        data.length === 0
      ) {
        throw new Error(
          "A conversa não foi excluída do banco de dados.",
        )
      }

      /*
       * Somente depois da confirmação
       * do Supabase removemos da tela.
       */
      setConversations(
        (currentConversations) =>
          currentConversations.filter(
            (currentConversation) =>
              currentConversation.id !==
              conversation.id,
          ),
      )

      console.log(
        "Conversa excluída com sucesso:",
        conversation.id,
      )
    } catch (error) {
      console.error(
        "Erro ao excluir conversa:",
        error,
      )

      window.alert(
        "Não foi possível excluir a conversa. Ela não foi removida do banco de dados.",
      )
    } finally {
      setDeletingConversationId(
        null,
      )
    }
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
              <h1>
                Mensagens
              </h1>

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

                const deleting =
                  deletingConversationId ===
                  conversation.id

                return (
                  <div
                    className={`admin-conversation-card ${
                      waiting
                        ? "waiting-human"
                        : ""
                    }`}
                    key={conversation.id}
                  >

                    <button
                      type="button"
                      className="admin-conversation-open"
                      onClick={() =>
                        navigate(
                          `/admin/mensagens/${conversation.id}`,
                        )
                      }
                      disabled={deleting}
                    >

                      <div className="admin-conversation-main">

                        <div className="admin-conversation-avatar">
                          {conversation.visitor_name
                            ?.trim()
                            .charAt(0)
                            .toUpperCase() ||
                            "M"}
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

                    </button>

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

                      <button
                        type="button"
                        className="admin-conversation-delete"
                        disabled={
                          deleting ||
                          deletingConversationId !== null
                        }
                        onClick={() =>
                          handleDeleteConversation(
                            conversation,
                          )
                        }
                        aria-label={`Excluir conversa de ${
                          conversation.visitor_name ||
                          "Visitante"
                        }`}
                        title="Excluir conversa"
                      >
                        {deleting
                          ? "Excluindo..."
                          : "🗑 Excluir"}
                      </button>

                    </div>

                  </div>
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