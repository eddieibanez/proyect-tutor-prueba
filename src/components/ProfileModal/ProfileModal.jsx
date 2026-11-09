import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import './ProfileModal.css';

const ProfileModal = ({ onClose }) => {
  const { user, updateUserProfile } = useApp();
  const [formData, setFormData] = useState({
    name: user.name || user.nombre || '',
    lastName: user.lastName || user.apellido || '',
    age: user.age || user.edad || 12,
    documentType: user.documentType || 'TI', // TI, CC, CE, PAS
    documentNumber: user.documentNumber || '',
    password: user.password || '',
    grade: user.grade || user.grado || '6'
  });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.password.trim()) {
      alert('Por favor completa al menos tu nombre y contraseña.');
      return;
    }

    updateUserProfile({
      ...formData,
      nombre: formData.name,
      apellido: formData.lastName,
      edad: parseInt(formData.age, 10),
      grado: formData.grade
    });

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="profile-modal-overlay" onClick={onClose}>
      <div className="profile-modal-card" onClick={e => e.stopPropagation()}>
        <div className="profile-modal-header">
          <div>
            <h3>👤 Mi Perfil y Datos Personales</h3>
            <p>Actualiza tu identificación, datos personales y clave de acceso</p>
          </div>
          <button type="button" className="close-btn" onClick={onClose}>✕</button>
        </div>

        {savedSuccess && (
          <div className="profile-saved-banner">
            ✅ ¡Información actualizada correctamente en la plataforma!
          </div>
        )}

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="profile-form-row">
            <div className="profile-form-group">
              <label>Nombres:</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="profile-form-group">
              <label>Apellidos:</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={e => setFormData({ ...formData, lastName: e.target.value })}
              />
            </div>
          </div>

          <div className="profile-form-row">
            <div className="profile-form-group">
              <label>Tipo de Documento:</label>
              <select
                value={formData.documentType}
                onChange={e => setFormData({ ...formData, documentType: e.target.value })}
              >
                <option value="TI">Tarjeta de Identidad (TI)</option>
                <option value="CC">Cédula de Ciudadanía (CC)</option>
                <option value="CE">Cédula de Extranjería (CE)</option>
                <option value="PAS">Pasaporte (PAS)</option>
              </select>
            </div>
            <div className="profile-form-group">
              <label>Número de Documento:</label>
              <input
                type="text"
                placeholder="Ej: 1025896321"
                value={formData.documentNumber}
                onChange={e => setFormData({ ...formData, documentNumber: e.target.value })}
              />
            </div>
          </div>

          <div className="profile-form-row">
            <div className="profile-form-group">
              <label>Edad:</label>
              <input
                type="number"
                min="5"
                max="100"
                value={formData.age}
                onChange={e => setFormData({ ...formData, age: e.target.value })}
              />
            </div>

            {user.role === 'estudiante' && (
              <div className="profile-form-group">
                <label>Grado Escolar:</label>
                <select
                  value={formData.grade}
                  onChange={e => setFormData({ ...formData, grade: e.target.value })}
                >
                  {['6', '7', '8', '9', '10', '11'].map(g => (
                    <option key={g} value={g}>{g}° Grado</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="profile-form-group">
            <label>Contraseña de Acceso:</label>
            <input
              type="text"
              required
              minLength={6}
              value={formData.password}
              onChange={e => setFormData({ ...formData, password: e.target.value })}
            />
            <small className="field-hint">Mínimo 6 caracteres. Mantén tu contraseña segura.</small>
          </div>

          <div className="profile-actions-row">
            <button type="button" className="btn-profile-cancel" onClick={onClose}>
              Cerrar
            </button>
            <button type="submit" className="btn-profile-save">
              💾 Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileModal;
