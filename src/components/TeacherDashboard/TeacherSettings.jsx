import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import './TeacherSettings.css';

const TeacherSettings = () => {
  const { user, settings, updateSettings } = useApp();
  const [formData, setFormData] = useState({
    theme: settings.theme || 'dark',
    fontSize: settings.fontSize || 'normal',
    soundEffects: settings.soundEffects ?? true,
    notifications: settings.notifications ?? true,
    academicPeriod: '2026 - Período B',
    institutionName: 'Colegio Técnico en Informática y Robótica',
    minPassingGrade: 70,
    allowFreeRetry: true
  });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    updateSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="teacher-settings-view">
      <div className="settings-header-bar">
        <h2>⚙️ Configuraciones de la Plataforma</h2>
        <p className="subtitle">Personaliza los parámetros pedagógicos, visuales y del sistema para el salón de clases.</p>
      </div>

      {savedSuccess && (
        <div className="save-banner">
          ✅ ¡Configuraciones guardadas y aplicadas con éxito!
        </div>
      )}

      <form className="settings-form" onSubmit={handleSave}>
        {/* GRUPO 1: PARÁMETROS ACADÉMICOS */}
        <div className="settings-card">
          <h3>🎓 Parámetros Académicos y Evaluación</h3>
          
          <div className="setting-row">
            <div>
              <strong>Institución Educativa</strong>
              <p className="setting-desc">Nombre visible en los informes oficiales en PDF generados.</p>
            </div>
            <input
              type="text"
              value={formData.institutionName}
              onChange={e => setFormData({ ...formData, institutionName: e.target.value })}
              className="text-input"
            />
          </div>

          <div className="setting-row">
            <div>
              <strong>Período Lectivo / Semestre</strong>
              <p className="setting-desc">Vigencia académica para el registro de calificaciones.</p>
            </div>
            <input
              type="text"
              value={formData.academicPeriod}
              onChange={e => setFormData({ ...formData, academicPeriod: e.target.value })}
              className="text-input"
            />
          </div>

          <div className="setting-row">
            <div>
              <strong>Puntaje Mínimo de Aprobación (%)</strong>
              <p className="setting-desc">Porcentaje requerido en quizzes para desbloquear el siguiente nivel.</p>
            </div>
            <input
              type="number"
              min="50"
              max="100"
              value={formData.minPassingGrade}
              onChange={e => setFormData({ ...formData, minPassingGrade: parseInt(e.target.value, 10) })}
              className="number-input"
            />
          </div>

          <div className="setting-row">
            <div>
              <strong>Permitir Reintentos Ilimitados de Quizzes</strong>
              <p className="setting-desc">Fomenta el aprendizaje formativo permitiendo al estudiante volver a intentar.</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={formData.allowFreeRetry}
                onChange={e => setFormData({ ...formData, allowFreeRetry: e.target.checked })}
              />
              <span className="slider"></span>
            </label>
          </div>
        </div>

        {/* GRUPO 2: PREFERENCIAS DE INTERFAZ Y ASISTENCIA */}
        <div className="settings-card">
          <h3>🖥️ Interfaz y Preferencias Visuales</h3>

          <div className="setting-row">
            <div>
              <strong>Tamaño de Fuente en Editor</strong>
              <p className="setting-desc">Ajusta la legibilidad para proyectores o pantallas en el aula.</p>
            </div>
            <select
              value={formData.fontSize}
              onChange={e => setFormData({ ...formData, fontSize: e.target.value })}
              className="select-input"
            >
              <option value="small">Compacto (13px)</option>
              <option value="normal">Normal (15px)</option>
              <option value="large">Grande - Proyector (18px)</option>
            </select>
          </div>

          <div className="setting-row">
            <div>
              <strong>Efectos de Sonido en Evaluaciones</strong>
              <p className="setting-desc">Retroalimentación auditiva al completar respuestas o acertar.</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={formData.soundEffects}
                onChange={e => setFormData({ ...formData, soundEffects: e.target.checked })}
              />
              <span className="slider"></span>
            </label>
          </div>

          <div className="setting-row">
            <div>
              <strong>Notificaciones de Nuevos Mensajes de Alumnos</strong>
              <p className="setting-desc">Alertas visuales en la cinta lateral al recibir dudas de estudiantes.</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={formData.notifications}
                onChange={e => setFormData({ ...formData, notifications: e.target.checked })}
              />
              <span className="slider"></span>
            </label>
          </div>
        </div>

        <div className="form-submit-row">
          <button type="submit" className="btn-save-settings">
            💾 Guardar Preferencias
          </button>
        </div>
      </form>
    </div>
  );
};

export default TeacherSettings;
