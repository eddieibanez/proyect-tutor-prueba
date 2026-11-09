import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import './StudentPreviewBanner.css';

const StudentPreviewBanner = () => {
  const navigate = useNavigate();
  const { previewMode, disablePreview, setPreviewGrade, togglePreviewUnlockAll, courses } = useApp();

  if (!previewMode || !previewMode.active) {
    return null;
  }

  const currentCourse = courses.find(c => c.grade === String(previewMode.grade));

  return (
    <div className="global-preview-banner">
      <div className="banner-left-section">
        <span className="banner-pulse-dot"></span>
        <span className="banner-title-badge">👁️ MODO VISTA DE ESTUDIANTES</span>
        <span className="banner-info-text">
          Estás interactuando con la plataforma tal como la ve un estudiante en tiempo real.
        </span>
      </div>

      <div className="banner-controls-cluster">
        {/* SELECTOR DE GRADO */}
        <div className="grade-selector-group">
          <label htmlFor="preview-grade-select">Grado del Alumno:</label>
          <select
            id="preview-grade-select"
            value={previewMode.grade}
            onChange={(e) => setPreviewGrade(e.target.value)}
          >
            <option value="6">6° Grado (Primaria)</option>
            <option value="7">7° Grado (Secundaria)</option>
            <option value="8">8° Grado (Secundaria)</option>
            <option value="9">9° Grado (Secundaria)</option>
            <option value="10">10° Grado (Media)</option>
            <option value="11">11° Grado (Media)</option>
          </select>
        </div>

        {/* CURSO ASOCIADO */}
        {currentCourse && (
          <span className="course-chip" title={currentCourse.name}>
            📚 {currentCourse.code}: {currentCourse.name.slice(0, 24)}...
          </span>
        )}

        {/* ALTERNADOR DE DESBLOQUEO TOTAL PARA INSPECCIÓN */}
        <button
          type="button"
          className={`btn-toggle-unlock ${previewMode.unlockedAll ? 'unlocked' : 'locked'}`}
          onClick={togglePreviewUnlockAll}
          title="Permite a los profesores probar cualquier nivel (1-15) sin tener que completar los anteriores"
        >
          {previewMode.unlockedAll ? '🔓 Todos los Niveles Abiertos' : '🔒 Progreso Secuencial'}
        </button>

        {/* BOTÓN PARA SALIR Y VOLVER AL PANEL DOCENTE */}
        <button
          type="button"
          className="btn-exit-preview"
          onClick={() => {
            disablePreview();
            navigate('/teacher');
          }}
        >
          ← Salir al Panel Docente
        </button>
      </div>
    </div>
  );
};

export default StudentPreviewBanner;
