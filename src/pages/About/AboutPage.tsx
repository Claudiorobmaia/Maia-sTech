import Header from "../../components/Header/Header"

import "./AboutPage.css"

function AboutPage() {
  return (
    <>
      <Header />

      <main className="about-page">
        <section className="about-hero">
          <div className="about-container">
            <span className="about-eyebrow">
              MAIA&apos;S TECH
            </span>

            <h1>
              Tecnologia, confiança e atendimento
              de verdade.
            </h1>

            <p className="about-hero-text">
              A Maia&apos;s Tech trabalha com
              periféricos, componentes e produtos
              para o universo gamer, oferecendo
              opções novas e seminovas com
              procedência, transparência e
              atendimento personalizado.
            </p>
          </div>
        </section>

        <section className="about-content">
          <div className="about-container">
            <div className="about-intro">
              <span>QUEM SOMOS</span>

              <h2>
                Muito mais do que vender produtos.
              </h2>

              <p>
                A Maia&apos;s Tech está situada em
                Piracicaba, São Paulo, e nasceu com
                a proposta de oferecer tecnologia,
                periféricos e produtos gamers com
                um atendimento próximo, responsável
                e transparente.
              </p>

              <p>
                Trabalhamos com produtos novos e
                seminovos, sempre prezando pela
                procedência dos itens e por uma
                negociação clara com nossos
                clientes.
              </p>

              <p>
                Nosso objetivo é que cada cliente
                tenha segurança durante toda a
                negociação, desde a primeira dúvida
                até o recebimento do produto e o
                suporte posterior.
              </p>
            </div>

            <div className="about-grid">
              <article className="about-card">
                <span className="about-card-number">
                  01
                </span>

                <h3>
                  Produtos novos e seminovos
                </h3>

                <p>
                  Trabalhamos com periféricos,
                  componentes e produtos voltados
                  para tecnologia e o universo
                  gamer, incluindo opções novas e
                  seminovas.
                </p>
              </article>

              <article className="about-card">
                <span className="about-card-number">
                  02
                </span>

                <h3>
                  Atendimento personalizado
                </h3>

                <p>
                  Cada cliente pode falar conosco
                  pelo WhatsApp, pelo nosso chat
                  próprio e pelos demais canais de
                  contato disponíveis.
                </p>
              </article>

              <article className="about-card">
                <span className="about-card-number">
                  03
                </span>

                <h3>
                  Dúvidas e suporte
                </h3>

                <p>
                  Ajudamos com dúvidas sobre
                  produtos, características,
                  compatibilidade e escolha de
                  componentes antes da compra e
                  também oferecemos suporte após
                  a negociação.
                </p>
              </article>

              <article className="about-card">
                <span className="about-card-number">
                  04
                </span>

                <h3>
                  Procedência e garantia
                </h3>

                <p>
                  Prezamos pela procedência dos
                  produtos comercializados e pelas
                  condições de garantia informadas
                  durante cada negociação.
                </p>
              </article>

              <article className="about-card">
                <span className="about-card-number">
                  05
                </span>

                <h3>
                  Entregamos em todo o Brasil
                </h3>

                <p>
                  Realizamos envios por Correios ou
                  transportadora, permitindo atender
                  clientes em diferentes regiões do
                  Brasil.
                </p>
              </article>

              <article className="about-card">
                <span className="about-card-number">
                  06
                </span>

                <h3>
                  Formas de pagamento
                </h3>

                <p>
                  As formas de pagamento podem ser
                  negociadas diretamente conosco,
                  buscando uma opção adequada para
                  cada negociação.
                </p>
              </article>
            </div>

            <div className="about-values">
              <div className="about-values-content">
                <span>NOSSOS VALORES</span>

                <h2>
                  Confiança começa com uma
                  negociação transparente.
                </h2>

                <p>
                  Na Maia&apos;s Tech prezamos pelo
                  respeito ao cliente, pela
                  responsabilidade e pela
                  transparência em cada atendimento.
                </p>

                <p>
                  Procuramos construir relações de
                  confiança, oferecendo informações
                  claras sobre os produtos,
                  condições da negociação, formas de
                  pagamento, envio e garantia.
                </p>

                <p>
                  Acreditamos que um bom atendimento
                  não termina depois da venda. Por
                  isso, mantemos diferentes canais
                  disponíveis para dúvidas,
                  informações e suporte.
                </p>
              </div>

              <div className="about-values-list">
                <div>
                  <strong>Confiança</strong>
                  <span>
                    Negociações claras e responsáveis.
                  </span>
                </div>

                <div>
                  <strong>Respeito</strong>
                  <span>
                    O cliente está no centro do nosso
                    atendimento.
                  </span>
                </div>

                <div>
                  <strong>Transparência</strong>
                  <span>
                    Informações claras em todas as
                    etapas da negociação.
                  </span>
                </div>

                <div>
                  <strong>Procedência</strong>
                  <span>
                    Cuidado com os produtos que
                    oferecemos aos nossos clientes.
                  </span>
                </div>

                <div>
                  <strong>Suporte</strong>
                  <span>
                    Diferentes canais para dúvidas e
                    atendimento.
                  </span>
                </div>
              </div>
            </div>

            <div className="about-location">
              <span>ONDE ESTAMOS</span>

              <h2>
                Piracicaba — São Paulo
              </h2>

              <p>
                Atendemos a partir de Piracicaba,
                São Paulo, e realizamos envios para
                todo o Brasil através dos Correios
                ou transportadoras.
              </p>

              <a
                href="https://wa.me/5519997531808"
                target="_blank"
                rel="noreferrer"
              >
                Falar com a Maia&apos;s Tech
                pelo WhatsApp →
              </a>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}

export default AboutPage