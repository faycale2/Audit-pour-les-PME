import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { deconnexion } from "../api/authApi";
import { getProfil } from "../api/adminApi";
import axiosClient from "../api/axiosClient";

import "./Sidebar.css";


function Sidebar({
  menuOuvert,
  onToggle,
}) {

  const [profil, setProfil] =
    useState(null);

  const role =
    localStorage.getItem("role");

  const navigate = useNavigate();
  const location = useLocation();

  const mediaBase =
    axiosClient.defaults.baseURL.replace(
      /\/api\/?$/,
      ""
    );


  useEffect(() => {

    getProfil()
      .then(setProfil)
      .catch(() => {});

  }, []);


  const handleDeconnexion = () => {

    deconnexion();

    navigate("/connexion");

  };


  const sectionConsultant =
    new URLSearchParams(
      location.search
    ).get("section") || "pmes";


  const consultantActive = (section) =>
    location.pathname === "/consultant" &&
    sectionConsultant === section;


  const classeLien = (actif) =>
    actif
      ? "sidebar-link sidebar-link-active"
      : "sidebar-link";


  const nomUtilisateur =
    profil?.nom ||
    profil?.username ||
    "Utilisateur";


  /*
   * Photo :
   * - nouvelle structure : profil.photo_url
   * - ancienne structure PME : profil.pme.photo_url
   */

  const photoProfil =
    profil?.photo_url ||
    profil?.pme?.photo_url ||
    null;


  const photoComplete = photoProfil
    ? photoProfil.startsWith("http")
      ? photoProfil
      : `${mediaBase}${photoProfil}`
    : null;


  return (

    <aside
      className={`sidebar ${
        menuOuvert ? "" : "collapsed"
      }`}
    >


      {/* =================================
          BRAND
      ================================= */}

      <div className="brand-mark">

        <div className="brand-logo">
          AC
        </div>

        <div className="brand-text">
          <strong>
            Audit Cyber
          </strong>

          <small>
            PME Maroc
          </small>
        </div>

      </div>


      {/* =================================
          TOGGLE
      ================================= */}

      <button
        type="button"
        className="menu-toggle"
        onClick={onToggle}
        aria-label={
          menuOuvert
            ? "Fermer le menu"
            : "Ouvrir le menu"
        }
      >

        <span className="toggle-icon">
          {menuOuvert ? "‹" : "›"}
        </span>

        <span className="toggle-label">
          {menuOuvert
            ? "Réduire"
            : "Menu"}
        </span>

      </button>


      <div className="sidebar-rule" />


      {/* =================================
          NAVIGATION
      ================================= */}

      <nav className="sidebar-nav">


        {/* =================================
            PME
        ================================= */}

        {role === "PME" && (

          <>

            <Link
              to="/questionnaire"
              className={classeLien(
                location.pathname ===
                  "/questionnaire"
              )}
            >

              <span className="sidebar-link-icon">
                ✓
              </span>

              <span className="sidebar-link-text">
                Questionnaire
              </span>

            </Link>


            <Link
              to="/evolution"
              className={classeLien(
                location.pathname ===
                  "/evolution"
              )}
            >

              <span className="sidebar-link-icon">
                ↗
              </span>

              <span className="sidebar-link-text">
                Historique
              </span>

            </Link>


            {/* =============================
                ACCOMPAGNEMENT
                Le choix du consultant
                se fait maintenant ici.
            ============================= */}

            <Link
              to="/accompagnement"
              className={classeLien(
                location.pathname ===
                  "/accompagnement"
              )}
            >

              <span className="sidebar-link-icon">
                ?
              </span>

              <span className="sidebar-link-text">
                Mon accompagnement
              </span>

            </Link>


            <Link
              to="/messages"
              className={classeLien(
                location.pathname ===
                  "/messages"
              )}
            >

              <span className="sidebar-link-icon">
                ✉
              </span>

              <span className="sidebar-link-text">
                Messagerie
              </span>

            </Link>

          </>

        )}


        {/* =================================
            ADMIN
        ================================= */}

        {role === "ADMIN" && (

          <>

            <Link
              to="/admin"
              className={classeLien(
                location.pathname ===
                  "/admin"
              )}
            >

              <span className="sidebar-link-icon">
                ▦
              </span>

              <span className="sidebar-link-text">
                Tableau de bord
              </span>

            </Link>


            <Link
              to="/admin/seuils"
              className={classeLien(
                location.pathname ===
                  "/admin/seuils"
              )}
            >

              <span className="sidebar-link-icon">
                ⚙
              </span>

              <span className="sidebar-link-text">
                Seuils
              </span>

            </Link>


            <Link
              to="/admin/utilisateurs"
              className={classeLien(
                location.pathname ===
                  "/admin/utilisateurs"
              )}
            >

              <span className="sidebar-link-icon">
                ◉
              </span>

              <span className="sidebar-link-text">
                Utilisateurs
              </span>

            </Link>


            <Link
              to="/admin/associations"
              className={classeLien(
                location.pathname ===
                  "/admin/associations"
              )}
            >

              <span className="sidebar-link-icon">
                ↔
              </span>

              <span className="sidebar-link-text">
                Associations
              </span>

            </Link>

          </>

        )}


        {/* =================================
            CONSULTANT
        ================================= */}

        {role === "CONSULTANT" && (

          <>

            <Link
              to="/consultant?section=pmes"
              className={classeLien(
                consultantActive("pmes")
              )}
            >

              <span className="sidebar-link-icon">
                ◉
              </span>

              <span className="sidebar-link-text">
                Mes PME
              </span>

            </Link>


            <Link
              to="/consultant?section=historique"
              className={classeLien(
                consultantActive("historique")
              )}
            >

              <span className="sidebar-link-icon">
                ↗
              </span>

              <span className="sidebar-link-text">
                Historique PME
              </span>

            </Link>


            <Link
              to="/consultant?section=messagerie"
              className={classeLien(
                consultantActive("messagerie")
              )}
            >

              <span className="sidebar-link-icon">
                ✉
              </span>

              <span className="sidebar-link-text">
                Messagerie
              </span>

            </Link>


            <Link
              to="/consultant?section=demandes"
              className={classeLien(
                consultantActive("demandes")
              )}
            >

              <span className="sidebar-link-icon">
                !
              </span>

              <span className="sidebar-link-text">
                Demandes
              </span>

            </Link>

          </>

        )}

      </nav>


      {/* =================================
          FOOTER
      ================================= */}

      <div className="sidebar-footer">


        {profil && (

          <div className="sidebar-profile">

            {photoComplete ? (

              <img
                className="sidebar-avatar"
                src={photoComplete}
                alt=""
              />

            ) : (

              <span className="sidebar-avatar sidebar-avatar-fallback">

                {nomUtilisateur
                  .slice(0, 1)
                  .toUpperCase()}

              </span>

            )}


            <div className="sidebar-profile-info">

              <strong>

                {profil.pme
                  ? profil.pme.nom_entreprise
                  : nomUtilisateur}

              </strong>

              <span className="sidebar-role">
                {profil.role}
              </span>

            </div>

          </div>

        )}


        <Link
          className="profile-link"
          to="/profil"
        >

          <span className="sidebar-link-icon">
            ◉
          </span>

          <span className="sidebar-link-text">
            Mon profil
          </span>

        </Link>


        <button
          type="button"
          className="link-button"
          onClick={handleDeconnexion}
        >

          <span className="sidebar-link-icon">
            ↪
          </span>

          <span className="sidebar-link-text">
            Déconnexion
          </span>

        </button>


      </div>

    </aside>

  );

}


export default Sidebar;