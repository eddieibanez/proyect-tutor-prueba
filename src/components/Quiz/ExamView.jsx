import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { finalExamsByLanguage } from '../../data/quizData';
import { IconCheck, IconAward, IconClock } from '../common/Icons';
import './ExamView.css';

const ExamView = () => {
  const { languageId } = useParams();
  const navigate = useNavigate();
  const { saveExamScore } = useApp();
  const langKey = languageId?.toLowerCase() || 'arduino';
  const questions = finalExamsByLanguage[langKey] || finalExamsByLanguage.arduino;

  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(30 * 60);
  const [isFinished, setIsFinished] = useState(false);
  const [fillValue, setFillValue] = useState('');

  useEffect(() => {
    if (isFinished) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timer); setIsFinished(true); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isFinished]);

  const calcScore = () => {
    let score = 0;
    questions.forEach(q => {
      if (q.type === 'mc' && answers[q.id] === q.answer) score++;
      else if (q.type === 'tf' && answers[q.id] === q.answer) score++;
      else if (q.type === 'fill' && (answers[q.id]||'').toLowerCase().trim() === q.answer.toLowerCase().trim()) score++;
    });
    return score;
  };

  const handleFinish = () => {
    setIsFinished(true);
    const score = calcScore();
    const percent = Math.round((score / questions.length) * 100);
    if (saveExamScore) saveExamScore(langKey, percent);
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return String(m).padStart(2,'0') + ':' + String(s).padStart(2,'0');
  };

  const currentQ = questions[currentIdx];

  if (isFinished) {
    const score = calcScore();
    const percent = Math.round((score / questions.length) * 100);
    const passed = percent >= 70;
    return (
      <div className="exam-results-container">
        <div className={'results-card ' + (passed ? 'passed' : 'failed')}>
          <div className="result-icon-badge"><IconAward size={48} color={passed ? '#00E676' : '#FF5252'} /></div>
          <h2>{passed ? 'Felicitaciones! Has Aprobado el Examen Final' : 'Examen No Aprobado'}</h2>
          <p className="exam-lang-target">Certificacion de Dominio en: {langKey.toUpperCase()}</p>
          <div className="score-circle">
            <span className="score-number">{percent}%</span>
            <span className="score-total">{score} / {questions.length} respuestas correctas</span>
          </div>
          <p className="result-message">
            {passed ? 'Has demostrado un dominio integral de la sintaxis, flujo de control y resolucion de algoritmos en este lenguaje.' : 'Te recomendamos repasar las lecciones clave y practicar en el editor interactivo antes de reintentar.'}
          </p>
          <div className="results-actions">
            <button className="btn-primary" onClick={() => navigate('/student/language/' + languageId)}>Volver a la Ruta de Aprendizaje</button>
            <button className="btn-secondary" onClick={() => navigate('/student')}>Ir al Panel Principal</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="exam-view-container">
      <header className="exam-header">
        <div className="exam-header-left">
          <h2>Examen de Certificacion Final: {langKey.toUpperCase()}</h2>
          <span className="exam-badge-count">Pregunta {currentIdx + 1} de {questions.length}</span>
        </div>
        <div className="exam-timer-pill">
          <IconClock size={18} color="#FF9800" />
          <span>Tiempo Restante: {formatTime(timeLeft)}</span>
        </div>
      </header>
      <div className="exam-progress-bar">
        <div className="exam-progress-fill" style={{ width: (((currentIdx + 1) / questions.length) * 100) + '%' }} />
      </div>
      <div className="exam-body-card">
        <div className="exam-question-text"><h3>{currentQ?.question}</h3></div>
        <div className="exam-answers-area">
          {currentQ?.type === 'mc' && (
            <div className="mc-options-grid">
              {(currentQ.options||[]).map((opt, i) => (
                <button key={i} className={'mc-opt-btn' + (answers[currentQ.id] === i ? ' selected' : '')} onClick={() => setAnswers({...answers, [currentQ.id]: i})}>
                  <span className="mc-letter">{String.fromCharCode(65+i)}</span>
                  <span className="mc-label">{opt}</span>
                </button>
              ))}
            </div>
          )}
          {currentQ?.type === 'tf' && (
            <div className="tf-options-row">
              {['Verdadero','Falso'].map(val => (
                <button key={val} className={'tf-btn' + (answers[currentQ.id] === val ? ' selected' : '')} onClick={() => setAnswers({...answers, [currentQ.id]: val})}>{val}</button>
              ))}
            </div>
          )}
          {currentQ?.type === 'fill' && (
            <div className="fill-blank-row">
              <input type="text" className="fill-input" placeholder="Escribe tu respuesta aqui..." value={answers[currentQ.id] || ''} onChange={e => setAnswers({...answers, [currentQ.id]: e.target.value})} />
            </div>
          )}
        </div>
      </div>
      <footer className="exam-footer">
        <button className="btn-secondary" onClick={() => setCurrentIdx(prev => Math.max(0, prev-1))} disabled={currentIdx === 0}>Anterior</button>
        {currentIdx < questions.length - 1
          ? <button className="btn-primary" onClick={() => setCurrentIdx(prev => Math.min(questions.length-1, prev+1))}>Siguiente</button>
          : <button className="btn-finish-exam" onClick={handleFinish}>Finalizar Examen</button>
        }
      </footer>
    </div>
  );
};
export default ExamView;