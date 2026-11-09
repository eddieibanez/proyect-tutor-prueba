import React, { useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import styles from './LanguageHub.module.css';
import { levelData } from '../../data/levelData';

export default function LanguageHub() {
  const { languageId } = useParams();
  const navigate = useNavigate();
  const { user, previewMode } = useContext(AppContext);
  
  const isPreview = previewMode?.active || user?.isPreview;
  const language = levelData[languageId];

  if (!language) {
    return (
      <div className={styles.errorContainer}>
        <h2>Lenguaje no encontrado</h2>
        <button onClick={() => navigate('/student')} className={styles.backBtn}>
          Volver al Dashboard
        </button>
      </div>
    );
  }

  const progress = user?.progress?.[languageId] || { currentLevel: 1, lessonsCompleted: 0, quizScores: [] };
  const completedLevels = progress.lessonsCompleted;

  const getStatus = (levelId) => {
    if (isPreview && previewMode?.unlockedAll) return 'completed';
    if (levelId <= completedLevels) return 'completed';
    if (levelId === completedLevels + 1) return 'in-progress';
    return 'locked';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return '✅';
      case 'in-progress': return '📝';
      case 'locked': return '🔒';
      default: return '🔒';
    }
  };

  const getStars = (levelId) => {
    const score = progress.quizScores?.[levelId - 1];
    if (score === undefined) return 0;
    if (score >= 90) return 3;
    if (score >= 70) return 2;
    if (score >= 40) return 1;
    return 0;
  };

  const renderStars = (levelId, status) => {
    if (status !== 'completed') return null;
    const stars = getStars(levelId);
    return (
      <div className={styles.stars}>
        {Array(3).fill(0).map((_, i) => (
          <span key={i} className={i < stars ? styles.starFilled : styles.starEmpty}>★</span>
        ))}
      </div>
    );
  };

  return (
    <div className={styles.hubContainer}>
      <header className={styles.header}>
        <button onClick={() => navigate('/student')} className={styles.backBtn}>
          &larr; Volver
        </button>
        <div className={styles.titleContainer}>
          <span className={styles.langIcon}>{language.icon}</span>
          <div>
            <h1 className={styles.langName}>Ruta de Aprendizaje: {language.name}</h1>
            <p className={styles.progressSummary}>
              Progreso: {completedLevels}/15 niveles completados
            </p>
          </div>
        </div>
      </header>

      <div className={styles.pathContainer}>
        {language.levels.map((level, index) => {
          const status = getStatus(level.id);
          
          return (
            <div key={level.id} className={styles.levelWrapper}>
              <div 
                className={`${styles.levelCard} ${styles[status]}`}
                onClick={() => status !== 'locked' && navigate(`/student/lesson/${languageId}/${level.id}`)}
                style={{ cursor: status === 'locked' ? 'not-allowed' : 'pointer' }}
              >
                <div className={styles.levelHeader}>
                  <span className={styles.levelNumber}>Nivel {level.id}</span>
                  <span className={styles.statusIcon}>{getStatusIcon(status)}</span>
                </div>
                
                <h3 className={styles.levelTitle}>{level.title}</h3>
                <p className={styles.levelDesc}>{level.description}</p>
                
                {renderStars(level.id, status)}

                {status === 'completed' && (
                  <button 
                    className={styles.quizBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/student/quiz/${languageId}/${level.id}`);
                    }}
                  >
                    Repasar Quiz
                  </button>
                )}
              </div>
              
              {/* Conector de la ruta */}
              {index < language.levels.length - 1 && (
                <div className={`${styles.connector} ${status === 'completed' ? styles.connectorActive : ''}`}></div>
              )}
            </div>
          );
        })}
      </div>

      <div className={styles.finalExamSection}>
        <button 
          className={styles.finalExamBtn} 
          disabled={completedLevels < 15 && !(isPreview && previewMode?.unlockedAll)}
          onClick={() => (completedLevels >= 15 || (isPreview && previewMode?.unlockedAll)) && navigate(`/student/exam/${languageId}`)}
        >
          🏆 Examen Final
        </button>
        {completedLevels < 15 && !(isPreview && previewMode?.unlockedAll) && (
          <p className={styles.examHint}>Completa todos los niveles para desbloquear el examen final.</p>
        )}
      </div>
    </div>
  );
}
