import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import './ExamView.css';

// 10 Hardcoded questions to mix types
const examQuestions = [
  { id: 1, type: 'mc', question: '¿Qué es una variable?', options: ['Un contenedor para guardar datos', 'Un error en el código', 'Una función especial', 'Un tipo de pantalla'], answer: 0 },
  { id: 2, type: 'tf', question: '¿El ciclo FOR se usa cuando NO sabemos cuántas veces se repetirá el código?', answer: 'Falso' },
  { id: 3, type: 'mc', question: '¿Cuál no es un lenguaje de programación?', options: ['Python', 'Scratch', 'HTML', 'Arduino (C++)'], answer: 2 },
  { id: 4, type: 'fill', question: 'En Python, la función para mostrar texto en pantalla es _____().', answer: 'print' },
  { id: 5, type: 'mc', question: '¿Qué hace un bloque "Si... entonces" (if)?', options: ['Repite el código', 'Toma una decisión basada en una condición', 'Apaga el programa', 'Suma dos números'], answer: 1 },
  { id: 6, type: 'tf', question: 'En Arduino, HIGH significa que el pin está enviando voltaje (encendido).', answer: 'Verdadero' },
  { id: 7, type: 'mc', question: '¿Qué operador lógico significa "Y" (AND)?', options: ['||', '&&', '!', '=='], answer: 1 },
  { id: 8, type: 'fill', question: 'Un bucle _____ se repite mientras una condición sea verdadera.', answer: 'while' },
  { id: 9, type: 'order', question: 'Ordena el código para un Hola Mundo en Python', options: ['("Hola Mundo")', 'print'], answer: ['print', '("Hola Mundo")'] }, // simplified ordering
  { id: 10, type: 'mc', question: '¿Cómo iniciamos un bloque en Scratch usualmente?', options: ['Al presionar bandera verde', 'Al escribir código', 'Al enchufar el cable', 'No se inicia'], answer: 0 }
];

const ExamView = () => {
  const { languageId } = useParams();
  const navigate = useNavigate();
  const { saveExamScore } = useApp();

  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes
  const [isFinished, setIsFinished] = useState(false);
  const [fillValue, setFillValue] = useState('');

  useEffect(() => {
    if (isFinished) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          finishExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isFinished]);

  const finishExam = () => {
    setIsFinished(true);
    // calculate score
    let score = 0;
    examQuestions.forEach(q => {
      if (q.type === 'mc' && answers[q.id] === q.answer) score++;
      else if (q.type === 'tf' && answers[q.id] === q.answer) score++;
      else if (q.type === 'fill' && answers[q.id]?.toLowerCase() === q.answer.toLowerCase()) score++;
      else if (q.type === 'order' && JSON.stringify(answers[q.id]) === JSON.stringify(q.answer)) score++;
    });
    
    if (saveExamScore) {
      saveExamScore(languageId, Math.round((score / examQuestions.length) * 100));
    }
  };

  const handleNext = () => {
    const q = examQuestions[currentIdx];
    if (q.type === 'fill') {
      setAnswers({ ...answers, [q.id]: fillValue });
      setFillValue('');
    }

    if (currentIdx < examQuestions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      finishExam();
    }
  };

  const handleSelectAnswer = (val) => {
    setAnswers({ ...answers, [examQuestions[currentIdx].id]: val });
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (isFinished) {
    let score = 0;
    examQuestions.forEach(q => {
      if (q.type === 'mc' && answers[q.id] === q.answer) score++;
      else if (q.type === 'tf' && answers[q.id] === q.answer) score++;
      else if (q.type === 'fill' && answers[q.id]?.toLowerCase() === q.answer.toLowerCase()) score++;
      else if (q.type === 'order' && JSON.stringify(answers[q.id]) === JSON.stringify(q.answer)) score++;
    });
    const percentage = (score / examQuestions.length) * 100;
    const passed = percentage >= 70;

    return (
      <div className="exam-results">
        <h2>Resultados del Examen Final</h2>
        <div className={`score-badge ${passed ? 'passed' : 'failed'}`}>
          {percentage}%
        </div>
        <p>Has respondido correctamente {score} de {examQuestions.length} preguntas.</p>

        {passed ? (
          <div className="certificate">
            <h3>🏆 Certificado de Finalización 🏆</h3>
            <p>¡Felicidades! Has completado con éxito el curso de {languageId?.toUpperCase() || 'Programación'}.</p>
          </div>
        ) : (
          <div className="failed-msg">
            <p>Necesitas un 70% para aprobar. ¡Sigue estudiando y vuelve a intentarlo!</p>
          </div>
        )}

        <div className="breakdown">
          <h3>Detalle de Respuestas</h3>
          <ul>
            {examQuestions.map(q => {
              let isRight = false;
              if (q.type === 'mc' || q.type === 'tf') isRight = answers[q.id] === q.answer;
              if (q.type === 'fill') isRight = answers[q.id]?.toLowerCase() === q.answer.toLowerCase();
              if (q.type === 'order') isRight = JSON.stringify(answers[q.id]) === JSON.stringify(q.answer);

              return (
                <li key={q.id} className={isRight ? 'text-success' : 'text-error'}>
                  Pregunta {q.id}: {isRight ? 'Correcta' : 'Incorrecta'}
                </li>
              );
            })}
          </ul>
        </div>

        <button className="btn-primary" onClick={() => navigate('/')}>Volver al Inicio</button>
      </div>
    );
  }

  const q = examQuestions[currentIdx];

  return (
    <div className="exam-container">
      <header className="exam-header">
        <h2>Examen Final: {languageId?.toUpperCase() || 'General'}</h2>
        <div className={`timer ${timeLeft < 300 ? 'timer-warning' : ''}`}>
          ⏱ {formatTime(timeLeft)}
        </div>
      </header>

      <div className="exam-progress">
        Pregunta {currentIdx + 1} de {examQuestions.length}
      </div>

      <div className="exam-question-card">
        <h3>{q.question}</h3>

        {q.type === 'mc' && (
          <div className="mc-options">
            {q.options.map((opt, i) => (
              <label key={i} className={`exam-option ${answers[q.id] === i ? 'selected' : ''}`}>
                <input 
                  type="radio" 
                  name={`q-${q.id}`} 
                  checked={answers[q.id] === i}
                  onChange={() => handleSelectAnswer(i)}
                />
                {opt}
              </label>
            ))}
          </div>
        )}

        {q.type === 'tf' && (
          <div className="tf-options">
            <button 
              className={`tf-btn ${answers[q.id] === 'Verdadero' ? 'selected' : ''}`}
              onClick={() => handleSelectAnswer('Verdadero')}
            >Verdadero</button>
            <button 
              className={`tf-btn ${answers[q.id] === 'Falso' ? 'selected' : ''}`}
              onClick={() => handleSelectAnswer('Falso')}
            >Falso</button>
          </div>
        )}

        {q.type === 'fill' && (
          <div className="fill-options">
            <input 
              type="text" 
              placeholder="Escribe tu respuesta aquí" 
              value={fillValue}
              onChange={(e) => setFillValue(e.target.value)}
              className="fill-input"
            />
          </div>
        )}

        {q.type === 'order' && (
          <div className="order-options">
            <p className="order-hint">Para este demo simplificado, haz clic para seleccionar la respuesta correcta preordenada:</p>
            <button 
              className={`order-btn ${answers[q.id] ? 'selected' : ''}`}
              onClick={() => handleSelectAnswer(['print', '("Hola Mundo")'])}
            >
              1. print<br/>2. ("Hola Mundo")
            </button>
          </div>
        )}
      </div>

      <div className="exam-footer">
        <button 
          className="btn-primary exam-next" 
          onClick={handleNext}
          disabled={q.type === 'mc' && answers[q.id] === undefined || q.type === 'tf' && answers[q.id] === undefined || q.type === 'order' && !answers[q.id]}
        >
          {currentIdx === examQuestions.length - 1 ? 'Finalizar Examen' : 'Siguiente Pregunta'}
        </button>
      </div>
    </div>
  );
};

export default ExamView;
