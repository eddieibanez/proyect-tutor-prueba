import React, { useContext, useState, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import './Navbar.css';
import UnifiedMessenger from '../Messaging/UnifiedMessenger';
import NotificationsCenterModal from '../Notifications/NotificationsCenterModal';
import ProfileModal from '../ProfileModal/ProfileModal';

const Navbar = () => {
  const { 
    user, 
    realUser, 
    previewMode, 
    enablePreview, 
    disablePreview, 
    logout, 
    theme, 
    toggleTheme, 
    messages, 
    tasks, 
    customContent 
  } = useContext(AppContext);

  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showMessenger, setShowMessenger] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const isTeacherAccount = realUser?.role === 'profesor' || user?.role === 'profesor';

  const handleLogout = () => {
    if (disablePreview) disablePreview();
    logout();
    navigate('/');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Cálculo de mensajes no leídos para la insignia (dot rojo)
  const unreadMessagesCount = useMemo(() => {
    if (!user || !messages) return 0;
    return messages.filter(m => {
      if (user.role === 'profesor') {
        return m.sender === 'student' && !m.read;
      }
      return m.receiverId === user.id && !m.read;
    }).length;
  }, [messages, user]);

  // Cálculo de notificaciones no leídas para la insignia (dot amarillo / rojo)
  const unreadNotifsCount = useMemo(() => {
    if (!user) return 0;
    const readIds = JSON.parse(localStorage.getItem('codecraft_read_notifs') || '[]');
    let count = 0;

    // Tareas pendientes
    const now = new Date();
    (tasks || []).forEach(t => {
      const id = `task-alert-${t.id}`;
      if (!readIds.includes(id)) count++;
    });

    // Lecciones pendientes
    if (user.role !== 'profesor' && user.progress) {
      ['arduino', 'scratch', 'python'].forEach(lang => {
        const prog = user.progress[lang] || { lessonsCompleted: 0 };
        if (prog.lessonsCompleted < 15 && !readIds.includes(`lesson-alert-${lang}`)) {
          count++;
        }
      });
    }

    // Cambios de contenido
    if (customContent) {
      Object.keys(customContent).forEach(k => {
        if (!readIds.includes(`content-mod-${k}`)) count++;
      });
    }

    return count;
  }, [tasks, user, customContent]);

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
    <>
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
            {user && (
              <>
                {/* BOTÓN CENTRO DE NOTIFICACIONES */}
                <button 
                  type="button" 
                  className="btn-nav-action" 
                  onClick={() => setShowNotifications(true)} 
                  title="Centro de Notificaciones y Plazos"
                >
                  <span className="nav-icon-text">🔔</span>
                  {unreadNotifsCount > 0 && (
                    <span className="nav-badge-dot warning" title={`${unreadNotifsCount} notificaciones nuevas`}></span>
                  )}
                </button>

                {/* BOTÓN MENSAJERÍA DIRECTA */}
                <button 
                  type="button" 
                  className="btn-nav-action" 
                  onClick={() => setShowMessenger(true)} 
                  title="Mensajería en tiempo real"
                >
                  <span className="nav-icon-text">💬</span>
                  {unreadMessagesCount > 0 && (
                    <span className="nav-badge-dot danger" title={`${unreadMessagesCount} mensajes no leídos`}></span>
                  )}
                </button>
              </>
            )}

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
                  <span 
                    className="user-name clickable-profile" 
                    onClick={() => setShowProfile(true)} 
                    title="Clic para editar tu información personal y clave"
                  >
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

      {/* MODALES GLOBALES CON RENDER FUERA DEL NAV PARA EVITAR STACKING CONTEXT */}
      {showMessenger && <UnifiedMessenger onClose={() => setShowMessenger(false)} />}
      {showNotifications && (
        <NotificationsCenterModal 
          onClose={() => setShowNotifications(false)} 
          onNavigateLesson={(langId, levelId) => navigate(`/student/lesson/${langId}/${levelId}`)}
        />
      )}
      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}
    </>
  );
};

export default Navbar;
