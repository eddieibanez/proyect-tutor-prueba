import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { lessonContent } from '../../data/lessonContent';
import { levelData } from '../../data/levelData';
import { useApp } from '../../context/AppContext';
import CodeEditor from './CodeEditor';
import './LessonView.css';

const LessonView = () => {
  const { languageId, levelId } = useParams();
  const navigate = useNavigate();
  const { user, previewMode, completeLesson, customContent } = useApp();
  const [activeTab, setActiveTab] = useState('theory');
  const [hintsUsed, setHintsUsed] = useState(0);

  const isPreview = previewMode?.active || user?.isPreview;

  const langKey = languageId?.toLowerCase();
  const currentNum = parseInt(levelId, 10);

  // Niveles del lenguaje actual
  const allLevels = levelData[langKey]?.levels || [];

  // Contenido de la lección (con soporte para personalizaciones del docente)
  const defaultLesson = lessonContent[langKey]?.[currentNum] || {
    title: allLevels.find(l => l.id === currentNum)?.title || `Nivel ${currentNum}`,
    theory: `<p>En esta lección aprenderás los fundamentos prácticos del nivel ${currentNum} en ${languageId}. Lee los conceptos, analiza el ejemplo y resuelve el reto en el editor interactivo.</p>`,
    example: {
      code: languageId === 'python' ? 'print("¡Bienvenido al nivel ' + currentNum + '!")' : '// Código de ejemplo del nivel ' + currentNum,
      explanation: 'Analiza cómo este código resuelve el problema planteado paso a paso.'
    },
    practice: {
      instructions: 'Escribe tu solución en el editor y presiona "Ejecutar Código" para verificar la salida.',
      initialCode: languageId === 'python' ? '# Tu código aquí\n' : '// Tu código aquí\n',
      expectedOutput: ''
    },
    challenge: {
      description: 'Reto aplicado: Diseña un algoritmo funcional para solucionar el problema planteado en este nivel.',
      hints: ['Analiza qué variables necesitas', 'Revisa la sintaxis del lenguaje', 'Prueba el código por partes en la consola']
    }
  };

  const customLesson = customContent?.[`${langKey}-${currentNum}`];
  const lesson = customLesson || defaultLesson;

  useEffect(() => {
    setActiveTab('theory');
    setHintsUsed(0);
  }, [languageId, levelId]);

  if (!lesson) {
    return (
      <div className="error-msg-container">
        <h2>Lección no encontrada</h2>
        <button onClick={() => navigate(`/student/language/${languageId}`)} className="btn-primary">
          Volver a la Ruta
        </button>
      </div>
    );
  }

  const handleNext = () => {
    if (completeLesson) {
      completeLesson(languageId, levelId);
    }
    navigate(`/student/quiz/${languageId}/${levelId}`);
  };

  const handlePrev = () => {
    if (currentNum > 1) {
      navigate(`/student/lesson/${languageId}/${currentNum - 1}`);
    } else {
      navigate(`/student/language/${languageId}`);
    }
  };

  // Progreso del estudiante en este lenguaje
  const studentProgress = user?.progress?.[langKey] || { lessonsCompleted: 0, currentLevel: 1 };
  const percentGlobal = Math.round((studentProgress.lessonsCompleted / 15) * 100);

  return (
    <div className="lesson-layout">
      {/* CINTA Y MENÚ LATERAL IZQUIERDO CON TODAS LAS LECCIONES */}
      <aside className="lesson-sidebar">
        <div className="sidebar-header">
          <button className="back-route-btn" onClick={() => navigate(`/student/language/${languageId}`)}>
            ← Volver a la Ruta
          </button>
          <div className="sidebar-lang-info">
            <span className="lang-icon-badge">{levelData[langKey]?.icon || '💻'}</span>
            <div>
              <h3>{levelData[langKey]?.name || languageId}</h3>
              <p className="global-progress-text">{studentProgress.lessonsCompleted}/15 completadas ({percentGlobal}%)</p>
            </div>
          </div>
          <div className="sidebar-progress-bar">
            <div className="sidebar-progress-fill" style={{ width: `${percentGlobal}%` }}></div>
          </div>
        </div>

        <div className="sidebar-lessons-list">
          <h4>Índice de Lecciones</h4>
          {allLevels.map((lvl) => {
            const isCompleted = lvl.id <= studentProgress.lessonsCompleted;
            const isCurrent = lvl.id === currentNum;
            const isLocked = !isPreview && lvl.id > (studentProgress.lessonsCompleted + 1);

            // Porcentaje de completación por lección (100% completada, 50% en curso, 0% bloqueada)
            const completionPercent = isCompleted ? 100 : isCurrent ? 50 : 0;

            return (
              <div
                key={lvl.id}
                className={`sidebar-lesson-item ${isCurrent ? 'current' : ''} ${isCompleted ? 'completed' : ''} ${isLocked ? 'locked' : ''}`}
                onClick={() => !isLocked && navigate(`/student/lesson/${languageId}/${lvl.id}`)}
              >
                <div className="item-row">
                  <span className="lesson-badge-num">Nivel {lvl.id}</span>
                  <span className="lesson-status-icon">
                    {isCompleted ? '✅' : isCurrent ? '📍' : isLocked ? '🔒' : '🔓'}
                  </span>
                </div>
                <div className="lesson-item-title">{lvl.title}</div>
                <div className="lesson-completion-indicator">
                  <div className="completion-bar">
                    <div className="completion-fill" style={{ width: `${completionPercent}%` }}></div>
                  </div>
                  <span className="completion-text">{completionPercent}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL DE LA LECCIÓN */}
      <main className="lesson-main-content">
        <header className="lesson-top-bar">
          <div className="lesson-title-area">
            <span className="active-level-pill">NIVEL ACTUAL: {levelId} / 15</span>
            <h2>{lesson.title}</h2>
          </div>
          <div className="lesson-quick-actions">
            <button className="nav-btn-secondary" onClick={handlePrev} disabled={currentNum === 1}>
              ← Anterior
            </button>
            <button className="nav-btn-primary" onClick={handleNext}>
              Ir al Quiz Formatizado →
            </button>
          </div>
        </header>

        {/* PESTAÑAS DE CONTENIDO */}
        <div className="lesson-tabs">
          <button className={`tab-btn ${activeTab === 'theory' ? 'active' : ''}`} onClick={() => setActiveTab('theory')}>
            📖 Teoría y Concepto
          </button>
          <button className={`tab-btn ${activeTab === 'example' ? 'active' : ''}`} onClick={() => setActiveTab('example')}>
            💡 Código de Ejemplo
          </button>
          <button className={`tab-btn ${activeTab === 'practice' ? 'active' : ''}`} onClick={() => setActiveTab('practice')}>
            💻 Práctica Interactiva
          </button>
          <button className={`tab-btn ${activeTab === 'challenge' ? 'active' : ''}`} onClick={() => setActiveTab('challenge')}>
            🏆 Reto con Pistas
          </button>
        </div>

        <div className="lesson-content-body">
          {activeTab === 'theory' && (
            <div className="tab-pane theory-pane">
              <div className="theory-card" dangerouslySetInnerHTML={{ __html: lesson.theory }}></div>
            </div>
          )}

          {activeTab === 'example' && (
            <div className="tab-pane example-pane">
              <div className="example-card">
                <p className="example-desc">{lesson.example.explanation}</p>
                <pre className="example-code-block">
                  <code>{lesson.example.code}</code>
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'practice' && (
            <div className="tab-pane practice-pane">
              <div className="instructions-box">
                <strong>📋 Instrucción de Práctica:</strong>
                <p>{lesson.practice.instructions}</p>
              </div>
              <CodeEditor
                language={langKey}
                initialCode={lesson.practice.initialCode}
                expectedOutput={lesson.practice.expectedOutput}
              />
            </div>
          )}

          {activeTab === 'challenge' && (
            <div className="tab-pane challenge-pane">
              <div className="challenge-card">
                <h3>🎯 Desafío Práctico de Programación</h3>
                <p>{lesson.challenge.description}</p>

                {lesson.challenge.hints && lesson.challenge.hints.length > 0 && (
                  <div className="hints-container">
                    <div className="hints-header">
                      <span>💡 Sistema de Pistas Pedagógicas ({hintsUsed}/{lesson.challenge.hints.length} reveladas):</span>
                      <button
                        className="reveal-hint-btn"
                        onClick={() => setHintsUsed(Math.min(hintsUsed + 1, lesson.challenge.hints.length))}
                        disabled={hintsUsed >= lesson.challenge.hints.length}
                      >
                        {hintsUsed >= lesson.challenge.hints.length ? 'Todas las pistas reveladas' : '+ Revelar siguiente pista'}
                      </button>
                    </div>
                    <ul className="hints-unlocked-list">
                      {lesson.challenge.hints.slice(0, hintsUsed).map((hint, idx) => (
                        <li key={idx} className="hint-pill">
                          <strong>Pista #{idx + 1}:</strong> {hint}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <CodeEditor
                language={langKey}
                initialCode={lesson.practice.initialCode || ''}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default LessonView;
