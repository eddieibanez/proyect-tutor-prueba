import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { levelData } from '../../data/levelData';
import { lessonContent } from '../../data/lessonContent';
import './ContentEditor.css';

const ContentEditor = () => {
  const navigate = useNavigate();
  const { customContent, saveCustomContent } = useApp();
  const [activeTab, setActiveTab] = useState('arduino');
  const [selectedLevelId, setSelectedLevelId] = useState(1);
  const [notification, setNotification] = useState('');

  // Load level and custom override if available
  const langKey = activeTab.toLowerCase();
  const defaultLesson = lessonContent[langKey]?.[selectedLevelId] || {
    title: levelData[langKey]?.levels?.find(l => l.id === selectedLevelId)?.title || `Nivel ${selectedLevelId}`,
    theory: '<p>Contenido explicativo del tema...</p>',
    example: { code: '// Código de ejemplo\n', explanation: 'Explicación del ejemplo...' },
    practice: { instructions: 'Instrucciones para resolver el ejercicio.', initialCode: '', expectedOutput: '' },
    challenge: { description: 'Reto práctico para el estudiante.', hints: ['Pista 1', 'Pista 2'] }
  };

  const savedData = customContent?.[`${langKey}-${selectedLevelId}`] || defaultLesson;

  const [formData, setFormData] = useState({
    title: savedData.title || '',
    theory: savedData.theory || '',
    exampleCode: savedData.example?.code || '',
    exampleExp: savedData.example?.explanation || '',
    practiceInst: savedData.practice?.instructions || '',
    practiceCode: savedData.practice?.initialCode || '',
    challengeDesc: savedData.challenge?.description || '',
    hints: savedData.challenge?.hints ? [...savedData.challenge.hints] : ['Pista 1', 'Pista 2'],
    visible: savedData.visible !== false,
    files: savedData.files || ['guia_laboratorio.pdf', 'diagrama_conexion.png']
  });

  const handleSelectLevel = (levelId) => {
    setSelectedLevelId(levelId);
    const currDefault = lessonContent[langKey]?.[levelId] || {
      title: levelData[langKey]?.levels?.find(l => l.id === levelId)?.title || `Nivel ${levelId}`,
      theory: '<p>Contenido explicativo del tema...</p>',
      example: { code: '// Código\n', explanation: 'Explicación...' },
      practice: { instructions: 'Instrucciones.', initialCode: '', expectedOutput: '' },
      challenge: { description: 'Reto.', hints: ['Pista 1'] }
    };
    const currSaved = customContent?.[`${langKey}-${levelId}`] || currDefault;
    setFormData({
      title: currSaved.title || '',
      theory: currSaved.theory || '',
      exampleCode: currSaved.example?.code || '',
      exampleExp: currSaved.example?.explanation || '',
      practiceInst: currSaved.practice?.instructions || '',
      practiceCode: currSaved.practice?.initialCode || '',
      challengeDesc: currSaved.challenge?.description || '',
      hints: currSaved.challenge?.hints ? [...currSaved.challenge.hints] : ['Pista de ayuda'],
      visible: currSaved.visible !== false,
      files: currSaved.files || ['recurso_didactico.pdf']
    });
  };

  const handleSave = () => {
    const updatedLesson = {
      title: formData.title,
      theory: formData.theory,
      example: { code: formData.exampleCode, explanation: formData.exampleExp },
      practice: { instructions: formData.practiceInst, initialCode: formData.practiceCode, expectedOutput: '' },
      challenge: { description: formData.challengeDesc, hints: formData.hints },
      visible: formData.visible,
      files: formData.files
    };
    saveCustomContent(langKey, selectedLevelId, updatedLesson);
    setNotification('¡Contenido guardado exitosamente!');
    setTimeout(() => setNotification(''), 3000);
  };

  const handleToggleVisibility = () => {
    setFormData(prev => ({ ...prev, visible: !prev.visible }));
  };

  const handleAddHint = () => {
    setFormData(prev => ({
      ...prev,
      hints: [...prev.hints, `Nueva pista ${prev.hints.length + 1}`]
    }));
  };

  const handleRemoveHint = (idx) => {
    setFormData(prev => ({
      ...prev,
      hints: prev.hints.filter((_, i) => i !== idx)
    }));
  };

  const handleHintChange = (idx, text) => {
    const newHints = [...formData.hints];
    newHints[idx] = text;
    setFormData(prev => ({ ...prev, hints: newHints }));
  };

  const handleAddFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        files: [...prev.files, file.name]
      }));
    }
  };

  const handleRemoveFile = (fileName) => {
    setFormData(prev => ({
      ...prev,
      files: prev.files.filter(f => f !== fileName)
    }));
  };

  const levels = levelData[langKey]?.levels || [];

  return (
    <div className="content-editor-container">
      {notification && <div className="editor-toast">{notification}</div>}
      
      <div className="editor-sidebar">
        <div className="sidebar-top">
          <button className="back-btn" onClick={() => navigate('/teacher')}>← Volver al Panel</button>
          <h2>Gestor de Lecciones</h2>
        </div>

        <div className="lang-tabs">
          {[
            { id: 'arduino', label: '🤖 Arduino' },
            { id: 'scratch', label: '🧩 Scratch' },
            { id: 'python', label: '🐍 Python' }
          ].map(lang => (
            <button 
              key={lang.id}
              className={`lang-tab ${activeTab === lang.id ? 'active' : ''}`}
              onClick={() => {
                setActiveTab(lang.id);
                handleSelectLevel(1);
              }}
            >
              {lang.label}
            </button>
          ))}
        </div>
        
        <div className="lessons-list">
          <h3>Niveles ({levels.length})</h3>
          {levels.map(level => {
            const isSaved = customContent?.[`${langKey}-${level.id}`];
            const isVisible = isSaved ? isSaved.visible !== false : true;
            return (
              <div 
                key={level.id} 
                className={`lesson-item ${selectedLevelId === level.id ? 'selected' : ''}`}
                onClick={() => handleSelectLevel(level.id)}
              >
                <div className="lesson-item-info">
                  <span className="lesson-num">#{level.id}</span>
                  <span className="lesson-title">{level.title}</span>
                </div>
                <div className="lesson-badges">
                  <span className={`status-badge-mini ${isVisible ? 'vis-visible' : 'vis-hidden'}`}>
                    {isVisible ? 'Visible' : 'Oculto'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="main-editor">
        <div className="editor-form">
          <div className="editor-header">
            <div className="header-left">
              <span className="level-badge">Nivel {selectedLevelId}</span>
              <input 
                type="text" 
                className="title-input" 
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                placeholder="Título de la lección"
              />
            </div>
            
            <div className="editor-actions">
              <button 
                type="button"
                className={`visibility-toggle-btn ${formData.visible ? 'visible' : 'hidden'}`}
                onClick={handleToggleVisibility}
                title="Habilitar u ocultar esta lección para los alumnos"
              >
                {formData.visible ? '👁️ Visible para Alumnos' : '🙈 Oculto para Alumnos'}
              </button>

              <button 
                type="button"
                className="preview-btn" 
                onClick={() => navigate(`/student/lesson/${langKey}/${selectedLevelId}`)}
              >
                ▶️ Ver como Estudiante
              </button>
              
              <button type="button" className="save-btn" onClick={handleSave}>
                💾 Guardar Cambios
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Contenido Teórico (Explicación)</label>
            <textarea 
              className="theory-editor"
              rows="5"
              value={formData.theory}
              onChange={e => setFormData({ ...formData, theory: e.target.value })}
              placeholder="Explica los conceptos de forma amigable para los estudiantes..."
            />
          </div>

          <div className="form-row">
            <div className="form-group half">
              <label>Código de Ejemplo</label>
              <textarea 
                className="code-editor"
                rows="6"
                value={formData.exampleCode}
                onChange={e => setFormData({ ...formData, exampleCode: e.target.value })}
                placeholder="// Escribe el código modelo aquí..."
              />
            </div>

            <div className="form-group half">
              <label>Explicación del Ejemplo</label>
              <textarea 
                className="theory-editor"
                rows="6"
                value={formData.exampleExp}
                onChange={e => setFormData({ ...formData, exampleExp: e.target.value })}
                placeholder="Describe cómo funciona cada parte del código..."
              />
            </div>
          </div>

          <div className="form-group">
            <label>Práctica (Instrucciones para el Alumno)</label>
            <textarea 
              className="theory-editor"
              rows="3"
              value={formData.practiceInst}
              onChange={e => setFormData({ ...formData, practiceInst: e.target.value })}
              placeholder="¿Qué reto debe programar el estudiante?"
            />
          </div>

          <div className="form-group">
            <label>Archivos y Recursos Didácticos Adjuntos</label>
            <div className="file-upload-area">
              <p>Arrastra archivos o haz clic para adjuntar material de apoyo (guías, simuladores, diagramas):</p>
              <input type="file" id="file-input" onChange={handleAddFile} style={{ display: 'none' }} />
              <label htmlFor="file-input" className="file-upload-btn">📎 Seleccionar Archivo</label>
              
              <div className="uploaded-files">
                {formData.files.map((file, idx) => (
                  <span key={idx} className="file-chip">
                    📄 {file} 
                    <button type="button" onClick={() => handleRemoveFile(file)} className="remove-file-btn">✕</button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Pistas Guiadas para el Bot y Estudiantes (Hints)</label>
            <div className="hints-list">
              {formData.hints.map((hint, idx) => (
                <div key={idx} className="hint-item">
                  <span className="hint-index">#{idx + 1}</span>
                  <input 
                    type="text" 
                    value={hint} 
                    onChange={(e) => handleHintChange(idx, e.target.value)}
                    placeholder={`Pista ${idx + 1}`}
                  />
                  <button type="button" className="remove-hint-btn" onClick={() => handleRemoveHint(idx)}>✕</button>
                </div>
              ))}
            </div>
            <button type="button" className="add-hint-btn" onClick={handleAddHint}>+ Añadir Nueva Pista</button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ContentEditor;
