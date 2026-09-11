import { Link } from "react-router-dom"

import "./Footer.css"

function Footer() {
  const currentYear =
    new Date().getFullYear()

  return (
    <footer className="site-footer">
      <div className="site-footer-glow" />

      <div className="site-footer-container">
        <div className="site-footer-main">
          <div className="site-footer-brand">
            <span className="site-footer-eyebrow">
              MAIA&apos;S TECH
            </span>

            <h2>
              Tecnologia para quem leva
              o setup a sério.
            </h2>

            <p>
              Hardware, componentes,
              periféricos e tecnologia
              para upgrades, novos setups
              e projetos personalizados.
            </p>

            <p>
              Conte com a Maia&apos;s Tech
              para conhecer os produtos
              disponíveis, tirar dúvidas
              e encontrar opções adequadas
              para o seu setup.
            </p>
          </div>

          <div className="site-footer-column">
            <h3>Produtos</h3>

            <ul>
              <li>Placas de vídeo</li>
              <li>Processadores</li>
              <li>Placas-mãe</li>
              <li>Memórias</li>
              <li>
                SSDs e armazenamento
              </li>
              <li>Gabinetes</li>
              <li>
                Mouse e periféricos
              </li>
              <li>Headsets</li>
            </ul>
          </div>

          <div className="site-footer-column">
            <h3>Atendimento</h3>

            <ul>
              <li>
                Informações sobre produtos
              </li>
              <li>
                Dúvidas sobre hardware
              </li>
              <li>
                Ajuda na escolha de
                componentes
              </li>
              <li>
                Atendimento pelo chat
              </li>
              <li>
                Atendimento pelo WhatsApp
              </li>
            </ul>
          </div>

          <div className="site-footer-column site-footer-contact">
            <h3>Fale conosco</h3>

            <a
              href="https://wa.me/5519997531808"
              target="_blank"
              rel="noreferrer"
              className="site-footer-social"
            >
              <span className="site-footer-social-icon">
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fill="currentColor"
                    d="M12.04 2a9.84 9.84 0 0 0-8.42 14.92L2 22l5.2-1.58A9.94 9.94 0 1 0 12.04 2Zm0 17.87a8.07 8.07 0 0 1-4.11-1.12l-.3-.18-3.08.94.98-3-.2-.31a7.92 7.92 0 1 1 6.71 3.67Zm4.43-5.93c-.24-.12-1.43-.7-1.65-.78-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06-.24-.12-1.01-.37-1.93-1.19-.71-.63-1.19-1.42-1.33-1.66-.14-.24-.01-.37.1-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.2-.47-.4-.4-.54-.41h-.46c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2 0 1.18.86 2.32.98 2.48.12.16 1.69 2.58 4.1 3.62.57.25 1.02.39 1.37.5.58.18 1.1.16 1.51.1.46-.07 1.43-.58 1.63-1.14.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.46-.28Z"
                  />
                </svg>
              </span>

              <span>
                <strong>WhatsApp</strong>
                <small>
                  +55 19 99753-1808
                </small>
              </span>
            </a>

            <a
              href="https://www.instagram.com/maia.stech/"
              target="_blank"
              rel="noreferrer"
              className="site-footer-social"
            >
              <span className="site-footer-social-icon">
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <rect
                    x="3"
                    y="3"
                    width="18"
                    height="18"
                    rx="5"
                    ry="5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  />

                  <circle
                    cx="12"
                    cy="12"
                    r="4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  />

                  <circle
                    cx="17.5"
                    cy="6.5"
                    r="1"
                    fill="currentColor"
                  />
                </svg>
              </span>

              <span>
                <strong>Instagram</strong>
                <small>
                  @maia.stech
                </small>
              </span>
            </a>
          </div>
        </div>

        <div className="site-footer-social-section">
          <div className="site-footer-social-heading">
            <span>CONECTE-SE</span>

            <h3>
              Acompanhe a Maia&apos;s Tech
              nas redes
            </h3>
          </div>

          <div className="site-footer-social-grid">
            <a
              href="https://www.tiktok.com/@maias.tech"
              target="_blank"
              rel="noreferrer"
              className="site-footer-network-card"
            >
              <div className="site-footer-network-icon">
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fill="currentColor"
                    d="M16.6 5.82a5.37 5.37 0 0 1-1.36-3.53h-3.87v15.54a3.25 3.25 0 1 1-2.81-3.22v-3.94a7.12 7.12 0 1 0 6.68 7.1v-7.89a9.2 9.2 0 0 0 5.38 1.72V7.73a5.4 5.4 0 0 1-4.02-1.91Z"
                  />
                </svg>
              </div>

              <div>
                <strong>
                  TikTok @maias.tech
                </strong>

                <span>
                  Produtos e serviços
                  da Maia&apos;s Tech
                </span>
              </div>

              <span className="site-footer-arrow">
                ↗
              </span>
            </a>

            <a
              href="https://www.tiktok.com/@maiasgames"
              target="_blank"
              rel="noreferrer"
              className="site-footer-network-card"
            >
              <div className="site-footer-network-icon">
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fill="currentColor"
                    d="M16.6 5.82a5.37 5.37 0 0 1-1.36-3.53h-3.87v15.54a3.25 3.25 0 1 1-2.81-3.22v-3.94a7.12 7.12 0 1 0 6.68 7.1v-7.89a9.2 9.2 0 0 0 5.38 1.72V7.73a5.4 5.4 0 0 1-4.02-1.91Z"
                  />
                </svg>
              </div>

              <div>
                <strong>
                  TikTok @maiasgames
                </strong>

                <span>
                  Games e conteúdo gamer
                </span>
              </div>

              <span className="site-footer-arrow">
                ↗
              </span>
            </a>

            <a
              href="https://www.instagram.com/maia.stech/"
              target="_blank"
              rel="noreferrer"
              className="site-footer-network-card"
            >
              <div className="site-footer-network-icon">
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <rect
                    x="3"
                    y="3"
                    width="18"
                    height="18"
                    rx="5"
                    ry="5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  />

                  <circle
                    cx="12"
                    cy="12"
                    r="4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  />

                  <circle
                    cx="17.5"
                    cy="6.5"
                    r="1"
                    fill="currentColor"
                  />
                </svg>
              </div>

              <div>
                <strong>Instagram</strong>
                <span>@maia.stech</span>
              </div>

              <span className="site-footer-arrow">
                ↗
              </span>
            </a>

            <a
              href="https://www.facebook.com/marketplace/?ref=app_tab"
              target="_blank"
              rel="noreferrer"
              className="site-footer-network-card"
            >
              <div className="site-footer-network-icon">
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fill="currentColor"
                    d="M14 8h3V4h-3c-3.31 0-5 1.96-5 5v2H6v4h3v7h4v-7h3.5l.5-4h-4V9c0-.68.32-1 1-1Z"
                  />
                </svg>
              </div>

              <div>
                <strong>Facebook</strong>
                <span>Marketplace</span>
              </div>

              <span className="site-footer-arrow">
                ↗
              </span>
            </a>
          </div>
        </div>

        <div className="site-footer-bottom">
          <div className="site-footer-copyright">
            <p>
              © {currentYear} Maia&apos;s Tech.
              Todos os direitos reservados.
            </p>

            <p className="site-footer-developer">
              Desenvolvido por{" "}
              <strong>Maia™</strong>
              <span> | </span>
              Sites • Sistemas Web •
              Automações com IA
            </p>
          </div>

          <div className="site-footer-bottom-links">
            <Link
              to="/"
              onClick={() => {
                window.scrollTo({
                  top: 0,
                  behavior: "smooth",
                })
              }}
            >
              Início
            </Link>

            <Link
              to="/quem-somos"
              onClick={() => {
                window.scrollTo({
                  top: 0,
                  behavior: "smooth",
                })
              }}
            >
              Quem somos
            </Link>

            <a
              href="https://wa.me/5519997531808"
              target="_blank"
              rel="noreferrer"
            >
              Contato
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer