import "./Hero.css"
import heroImage from "../../assets/images/hero.png"

function Hero() {
  return (
    <section className="hero">
      <div className="hero-background">
        <img src={heroImage} alt="Setup gamer Maia's Tech" />
      </div>

      <div className="hero-overlay"></div>

      <div className="hero-container">
        <div className="hero-content">
          <span className="hero-badge">
            HARDWARE • GAMES • TECNOLOGIA
          </span>

          <h1>
            Tecnologia para quem busca
            <span> performance.</span>
          </h1>

          <p>
            Hardware, componentes e produtos selecionados para elevar seu setup.
            Novos e seminovos com atendimento direto e especializado.
          </p>

          <div className="hero-actions">
            

            <a href="#categorias" className="hero-button hero-button-secondary">
              Explorar categorias
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero