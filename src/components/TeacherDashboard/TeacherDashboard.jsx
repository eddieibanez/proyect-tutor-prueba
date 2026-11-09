import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import StudentMonitor from './StudentMonitor';
import ContentEditor from './ContentEditor';
import TeacherCourses from './TeacherCourses';
import TeacherMessages from './TeacherMessages';
import TeacherSettings from './TeacherSettings';
import './TeacherDashboard.css';

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const { user, messages, enablePreview } = useApp();
  
  // Pestaña activa del sistema de cinta lateral
  const [activeTab, setActiveTab] = useState('monitor');

  // Conteo de mensajes no leídos
  const unreadCount = messages.filter(m => m.sender === 'student' && !m.read).length;

  return (
    <div className="teacher-panel-layout">
      {/* CINTA / BARRA LATERAL IZQUIERDA CON APARTADOS */}
      <aside className="teacher-sidebar-ribbon">
        <div className="ribbon-brand">
          <span className="brand-icon">🏫</span>
          <div className="brand-text">
            <h3>Panel Docente</h3>
            <p>CodeCraft Academy</p>
          </div>
        </div>

        <nav className="ribbon-nav">
          <button
            type="button"
            className={`ribbon-item ${activeTab === 'monitor' ? 'active' : ''}`}
            onClick={() => setActiveTab('monitor')}
          >
            <span className="ribbon-icon">📊</span>
            <div className="ribbon-label">
              <strong>Monitoreo y Análisis</strong>
              <small>Rendimiento, alertas y PDFs</small>
            </div>
          </button>

          <button
            type="button"
            className={`ribbon-item ${activeTab === 'editor' ? 'active' : ''}`}
            onClick={() => setActiveTab('editor')}
          >
            <span className="ribbon-icon">📝</span>
            <div className="ribbon-label">
              <strong>Modo Editor</strong>
              <small>Editar temas, retos y pistas</small>
            </div>
          </button>

          <button
            type="button"
            className={`ribbon-item ${activeTab === 'courses' ? 'active' : ''}`}
            onClick={() => setActiveTab('courses')}
          >
            <span className="ribbon-icon">📚</span>
            <div className="ribbon-label">
              <strong>Mis Cursos</strong>
              <small>Estudiantes matriculados</small>
            </div>
          </button>

          <button
            type="button"
            className={`ribbon-item ${activeTab === 'messages' ? 'active' : ''}`}
            onClick={() => setActiveTab('messages')}
          >
            <span className="ribbon-icon">💬</span>
            <div className="ribbon-label">
              <strong>Mensajería Directa</strong>
              <small>Chat con estudiantes</small>
            </div>
            {unreadCount > 0 && <span className="ribbon-badge">{unreadCount}</span>}
          </button>

          <button
            type="button"
            className={`ribbon-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <span className="ribbon-icon">⚙️</span>
            <div className="ribbon-label">
              <strong>Configuraciones</strong>
              <small>Evaluación y parámetros</small>
            </div>
          </button>
        </nav>

        <div className="ribbon-footer">
          <div className="teacher-mini-profile">
            <span className="teacher-avatar">👨‍🏫</span>
            <div className="teacher-info">
              <span>{user?.name ? `${user.name} ${user.lastName || ''}` : 'Profesor Titular'}</span>
              <small>Docente de Informática</small>
            </div>
          </div>
        </div>
      </aside>

      {/* ÁREA DE CONTENIDO PRINCIPAL CON BARRA SUPERIOR */}
      <div className="teacher-main-wrapper">
        <header className="teacher-top-navbar">
          <div className="top-title-breadcrumb">
            <span className="breadcrumb-path">Gestión Académica</span>
            <span className="breadcrumb-sep">/</span>
            <span className="breadcrumb-current">
              {activeTab === 'monitor' && 'Monitoreo y Análisis'}
              {activeTab === 'editor' && 'Modo Editor de Lecciones'}
              {activeTab === 'courses' && 'Cursos y Alumnos Matriculados'}
              {activeTab === 'messages' && 'Mensajería con Estudiantes'}
              {activeTab === 'settings' && 'Configuraciones de la Plataforma'}
            </span>
          </div>

          {/* BOTÓN MODO VISTA DE ESTUDIANTES EN LA PARTE SUPERIOR DERECHA */}
          <div className="top-right-actions">
            <button
              type="button"
              className="btn-student-view-top"
              onClick={() => {
                enablePreview('8');
                navigate('/student');
              }}
              title="Abrir vista simulada desde la perspectiva del estudiante"
            >
              👁️ Modo Vista de Estudiantes
            </button>
          </div>
        </header>

        {/* CONTENEDOR DEL APARTADO SELECCIONADO */}
        <div className="teacher-content-stage">
          {activeTab === 'monitor' && <StudentMonitor />}
          {activeTab === 'editor' && <ContentEditor />}
          {activeTab === 'courses' && <TeacherCourses />}
          {activeTab === 'messages' && <TeacherMessages />}
          {activeTab === 'settings' && <TeacherSettings />}
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
