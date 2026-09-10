// src/pages/Accueil.jsx - Version complète avec carrousel 3D et infos CMRPI
import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import "./Accueil.css";

// Logos (à placer dans src/assets/)
import cmrpiLogo from "../assets/cmrpi-logo.png";
import ausimLogo from "../assets/ausim-logo.png";
import emcLogo from "../assets/emc-logo.png";
import cndpLogo from "../assets/cndp-logo.png";

// Images du carrousel (à placer dans src/assets/carrousel/)
import img1 from "../assets/carrousel/formation1.jpg";
import img2 from "../assets/carrousel/formation2.jpg";
import img3 from "../assets/carrousel/formation3.jpg";
import img4 from "../assets/carrousel/formation4.jpg";
import img5 from "../assets/carrousel/formation5.jpg";

function Accueil() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const carouselRef = useRef(null);
  const slideInterval = useRef(null);

  const slides = [
    { image: img1, title: "Formation Cybersécurité 2014", desc: "Session normale : Détection et anticipation de cybermenaces" },
    { image: img2, title: "Formation Cybersécurité 2015", desc: "Formation spéciale pour les établissements bancaires" },
    { image: img3, title: "Formation Cybersécurité 2016", desc: "Maîtrise de risques majeurs de cybercriminalité" },
    { image: img4, title: "Formation Cybersécurité 2017", desc: "Gestion d'incidents et de crise cybernétique" },
    { image: img5, title: "Formation Cybersécurité 2018", desc: "Blockchain et intelligence artificielle au service de la cybersécurité" },
  ];

  useEffect(() => {
    setIsVisible(true);
    startAutoPlay();
    return () => stopAutoPlay();
  }, []);

  const startAutoPlay = () => {
    stopAutoPlay();
    slideInterval.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
  };

  const stopAutoPlay = () => {
    if (slideInterval.current) {
      clearInterval(slideInterval.current);
      slideInterval.current = null;
    }
  };

  const goToSlide = (index) => {
    stopAutoPlay();
    setCurrentSlide(index);
    setTimeout(startAutoPlay, 5000);
  };

  const nextSlide = () => {
    stopAutoPlay();
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setTimeout(startAutoPlay, 5000);
  };

  const prevSlide = () => {
    stopAutoPlay();
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setTimeout(startAutoPlay, 5000);
  };

  return (
    <div className="accueil-premium">
      {/* ===== HEADER ===== */}
      <header className="header-premium">
        <div className="header-container">
          <div className="header-brand">
            <div className="brand-logo-container">
              <img src={cmrpiLogo} alt="CMRPI" className="brand-logo" />
            </div>
            <div className="brand-text">
              <span className="brand-name">Audit PME</span>
              <span className="brand-sub">by CMRPI • Espace Maroc Cyberconfiance</span>
            </div>
          </div>
          <nav className="header-nav">
            <a href="#apropos" className="nav-link">À propos</a>
            <a href="#formations" className="nav-link">Formations</a>
            <a href="#partenaires" className="nav-link">Partenaires</a>
            <Link to="/connexion" className="nav-link">Connexion</Link>
            <Link to="/inscription" className="btn-primary-gradient">
              🚀 Commencer l'audit
            </Link>
          </nav>
        </div>
      </header>

      {/* ===== HERO SECTION ===== */}
      <section className={`hero-premium ${isVisible ? 'visible' : ''}`}>
        <div className="hero-bg">
          <div className="bg-orbe orbe-1"></div>
          <div className="bg-orbe orbe-2"></div>
          <div className="bg-orbe orbe-3"></div>
          <div className="bg-grid"></div>
        </div>

        <div className="hero-container">
          <div className="hero-left">
            <div className="hero-badge">
              <span className="badge-pulse"></span>
              Référentiel ISO 27001 • NIST CSF • Loi 09-08
            </div>
            <h1 className="hero-title">
              Évaluez votre maturité
              <span className="title-highlight">cybersécurité</span>
              <span className="title-sub">en quelques minutes</span>
            </h1>
            <p className="hero-desc">
              Audit complet basé sur les standards internationaux avec 
              recommandations personnalisées pour votre entreprise.
            </p>
            <div className="hero-actions">
              <Link to="/inscription" className="btn-hero">
                <span>🚀 Commencer l'audit</span>
                <span className="btn-arrow">→</span>
              </Link>
              <a href="#apropos" className="btn-outline">En savoir plus</a>
            </div>
            <div className="hero-stats">
              <div className="stat">
                <span className="stat-number">29</span>
                <span className="stat-label">Questions</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat">
                <span className="stat-number">5</span>
                <span className="stat-label">Thèmes</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat">
                <span className="stat-number">5</span>
                <span className="stat-label">Niveaux</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat">
                <span className="stat-number">100+</span>
                <span className="stat-label">PME auditées</span>
              </div>
            </div>
          </div>

          <div className="hero-right">
            <div className="card-3d-premium">
              <div className="card-content">
                <div className="card-header">
                  <span className="card-icon">📊</span>
                  <span className="card-badge">Rapport d'audit</span>
                </div>
                <div className="card-score">
                  <span className="score-number">70</span>
                  <span className="score-max">/116</span>
                </div>
                <div className="card-level">
                  <div className="level-bar">
                    <div className="level-fill" style={{ width: '60%' }}></div>
                  </div>
                  <span className="level-text">Niveau 4 — Contrôlé</span>
                </div>
                <div className="card-themes">
                  <div className="theme-dot" style={{ background: '#1E88E5' }}></div>
                  <div className="theme-dot" style={{ background: '#42A5F5' }}></div>
                  <div className="theme-dot" style={{ background: '#64B6F7' }}></div>
                  <div className="theme-dot" style={{ background: '#90CAF9' }}></div>
                  <div className="theme-dot" style={{ background: '#8B5CF6' }}></div>
                </div>
                <div className="card-footer">
                  <span className="card-date">Dernière évaluation • 15/08/2026</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CMRPI INFO SECTION ===== */}
      <section id="apropos" className="cmrpi-section">
        <div className="section-container">
          <div className="section-header">
            <span className="section-tag">À propos</span>
            <h2>Le CMRPI et la cybersécurité</h2>
            <p>
              Le Centre Marocain de Recherche Polytechnique et d'Innovation (CMRPI)
              accompagne les entreprises marocaines dans leur transformation numérique
              et le renforcement de leur cybersécurité.
            </p>
          </div>

          <div className="cmrpi-grid">
            <div className="cmrpi-card">
              <div className="cmrpi-icon">🏛️</div>
              <h3>Notre Mission</h3>
              <p>Promouvoir l'innovation et la sécurité numérique au Maroc en accompagnant les PME dans leur montée en compétences.</p>
            </div>
            <div className="cmrpi-card">
              <div className="cmrpi-icon">🛡️</div>
              <h3>Notre Engagement</h3>
              <p>Fournir des outils d'évaluation conformes aux standards internationaux pour renforcer la cybersécurité nationale.</p>
            </div>
            <div className="cmrpi-card">
              <div className="cmrpi-icon">🌍</div>
              <h3>Notre Vision</h3>
              <p>Faire du Maroc un hub régional de référence en matière de sécurité des systèmes d'information.</p>
            </div>
          </div>

          <div className="cmrpi-stats">
            <div className="stat-block">
              <span className="stat-number">2012</span>
              <span className="stat-label">Année de création</span>
            </div>
            <div className="stat-block">
              <span className="stat-number">500+</span>
              <span className="stat-label">Entreprises accompagnées</span>
            </div>
            <div className="stat-block">
              <span className="stat-number">15+</span>
              <span className="stat-label">Partenaires institutionnels</span>
            </div>
            <div className="stat-block">
              <span className="stat-number">8</span>
              <span className="stat-label">Années de formation</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CARROUSEL 3D DES FORMATIONS ===== */}
      <section id="formations" className="carousel-section">
        <div className="section-container">
          <div className="section-header">
            <span className="section-tag">Formations</span>
            <h2>Nos ateliers de cybersécurité</h2>
            <p>Depuis 2014, le CMRPI forme les professionnels marocains aux enjeux de la cybersécurité</p>
          </div>

          <div className="carousel-3d-container">
            <div className="carousel-wrapper">
              <div 
                className="carousel-track"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {slides.map((slide, index) => (
                  <div key={index} className="carousel-slide">
                    <div className="carousel-image-wrapper">
                      <img src={slide.image} alt={slide.title} className="carousel-image" />
                      <div className="carousel-overlay">
                        <div className="carousel-content">
                          <span className="carousel-year">{2014 + index}</span>
                          <h3>{slide.title}</h3>
                          <p>{slide.desc}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contrôles */}
            <button className="carousel-btn prev" onClick={prevSlide}>
              ‹
            </button>
            <button className="carousel-btn next" onClick={nextSlide}>
              ›
            </button>

            {/* Indicateurs */}
            <div className="carousel-dots">
              {slides.map((_, index) => (
                <button
                  key={index}
                  className={`carousel-dot ${index === currentSlide ? 'active' : ''}`}
                  onClick={() => goToSlide(index)}
                />
              ))}
            </div>

            {/* Info de la slide */}
            <div className="carousel-info">
              <span className="carousel-counter">
                {currentSlide + 1} / {slides.length}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== PARTENAIRES ===== */}
      <section id="partenaires" className="partners-section">
        <div className="section-container">
          <div className="section-header">
            <span className="section-tag">Écosystème</span>
            <h2>Nos partenaires institutionnels</h2>
          </div>

          <div className="partners-grid">
            <div className="partner-card">
              <img src={cmrpiLogo} alt="CMRPI" className="partner-logo" />
              <span className="partner-name">CMRPI</span>
            </div>
            <div className="partner-card">
              <img src={ausimLogo} alt="AUSIM" className="partner-logo" />
              <span className="partner-name">AUSIM</span>
            </div>
            <div className="partner-card">
              <img src={emcLogo} alt="EMC" className="partner-logo" />
              <span className="partner-name">Espace Maroc Cyberconfiance</span>
            </div>
            <div className="partner-card">
              <img src={cndpLogo} alt="CNDP" className="partner-logo" />
              <span className="partner-name">CNDP</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="cta-section">
        <div className="cta-container">
          <h2>Prêt à évaluer votre maturité ?</h2>
          <p>Rejoignez les entreprises qui améliorent leur cybersécurité chaque jour.</p>
          <Link to="/inscription" className="btn-cta-premium">
            Créer mon compte gratuitement
            <span className="btn-arrow">→</span>
          </Link>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="footer-premium">
        <div className="footer-container">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="footer-logo-container">
                <img src={cmrpiLogo} alt="CMRPI" className="footer-logo-img" />
              </div>
              <div>
                <span className="footer-title">Audit PME</span>
                <span className="footer-sub">by CMRPI</span>
                <p className="footer-desc">
                  Plateforme d'évaluation de maturité cybersécurité pour PME,
                  développée par le CMRPI — Espace Maroc Cyberconfiance.
                </p>
                <div className="footer-contact">
                  <span>📞 +212 654 55 79 92</span>
                  <span>✉️ contact@cmrpi.ma</span>
                  <span>🌐 www.cmrpi.ma</span>
                </div>
              </div>
            </div>
            <div className="footer-links">
              <div className="footer-col">
                <h4>Référentiels</h4>
                <a href="#">ISO/IEC 27001</a>
                <a href="#">NIST CSF</a>
                <a href="#">Loi 09-08</a>
              </div>
              <div className="footer-col">
                <h4>Ressources</h4>
                <a href="#">Documentation</a>
                <a href="#">Guides</a>
                <a href="#">FAQ</a>
              </div>
              <div className="footer-col">
                <h4>À propos</h4>
                <a href="#">CMRPI</a>
                <a href="#">Espace Maroc Cyberconfiance</a>
                <a href="#">AUSIM</a>
                <a href="#">Contact</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© 2024 Audit PME - CMRPI. Tous droits réservés.</span>
            <div className="footer-legal">
              <a href="#">Mentions légales</a>
              <a href="#">Politique de confidentialité</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Accueil;