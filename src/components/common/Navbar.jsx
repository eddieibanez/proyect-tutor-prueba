import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import './Navbar.css';

const Navbar = () => {
  const { user, realUser, previewMode, enablePreview, disablePreview, logout, theme, toggleTheme } = useContext(AppContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isTeacherAccount = realUser?.role === 'profesor' || user?.role === 'profesor';

  const handleLogout = () => {
    if (disablePreview) disablePreview();
    logout();
    navigate('/');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  if (!user && location.pathname === '/') {
    return null;
  }

  const handleStudentViewClick = () => {
    setIsMenuOpen(false);
    if (previewMode?.active) {
      disablePreview();
      navigate('/teacher');
    } else {
      enablePreview('8');
      navigate('/student');
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link 
          to={isTeacherAccount && !previewMode?.active ? '/teacher' : '/student'} 
          className="navbar-logo"
        >
          <span className="logo-brackets">&lt;/&gt;</span>
          <span className="logo-text">CodeCraft Academy</span>
        </Link>

        {user && (
          <div className="menu-icon" onClick={toggleMenu}>
            <div className={isMenuOpen ? "hamburger active" : "hamburger"}>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}

        <ul className={isMenuOpen ? "nav-menu active" : "nav-menu"}>
          {user && (
            <>
              {isTeacherAccount ? (
                <>
                  <li className="nav-item">
                    <Link 
                      to="/teacher" 
                      className={`nav-links ${!previewMode?.active ? 'active' : ''}`} 
                      onClick={() => {
                        if (disablePreview) disablePreview();
                        setIsMenuOpen(false);
                      }}
                    >
                      Panel Docente
                    </Link>
                  </li>
                  <li className="nav-item">
                    <button 
                      type="button" 
                      className="nav-links view-switch-btn" 
                      onClick={handleStudentViewClick}
                    >
                      {previewMode?.active ? '🏫 Volver a Docente' : '👁️ Vista Estudiante'}
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li className="nav-item">
                    <Link to="/student" className="nav-links" onClick={() => setIsMenuOpen(false)}>
                      Mis Cursos y Ruta
                    </Link>
                  </li>
                </>
              )}
            </>
          )}
        </ul>

        <div className="navbar-right-cluster">
          {/* BOTÓN CAMBIO DE MODO CLARO / OSCURO */}
          <button 
            type="button" 
            className="btn-theme-toggle" 
            onClick={toggleTheme} 
            title={theme === 'light' ? 'Cambiar a Modo Oscuro' : 'Cambiar a Modo Claro'}
          >
            {theme === 'light' ? '🌙 Modo Oscuro' : '☀️ Modo Claro'}
          </button>

          {user && (
            <div className={`navbar-user ${isMenuOpen ? 'active' : ''}`}>
              <div className="user-info">
                <span className="user-name">
                  {previewMode?.active 
                    ? `${realUser?.nombre || realUser?.name || 'Profesor'} ${realUser?.apellido || realUser?.lastName || ''}`
                    : `${user.nombre || user.name} ${user.apellido || user.lastName || ''}`
                  }
                </span>
                <span className="user-badge">
                  {previewMode?.active 
                    ? `👁️ Vista ${previewMode.grade}° Grado` 
                    : isTeacherAccount ? 'Profesor' : `${user.grado || user.grade}° Grado`
                  }
                </span>
              </div>
              <button className="btn-logout" onClick={handleLogout}>
                Salir
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
