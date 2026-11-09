import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { quizData } from '../../data/quizData';
import './QuizView.css';

const QuizView = () => {
  const { languageId, levelId } = useParams();
  const navigate = useNavigate();
  const { saveQuizScore, completeLesson } = useApp();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);

  const quiz = quizData[languageId]?.[levelId];

  useEffect(() => {
    setCurrentQuestion(0);
    setScore(0);
    setShowResults(false);
    setSelectedAnswer(null);
    setIsCorrect(null);
  }, [languageId, levelId]);

  if (!quiz) {
    return <div className="error-msg">Quiz no encontrado</div>;
  }

  const questions = quiz.questions;

  const handleAnswerClick = (index) => {
    if (selectedAnswer !== null) return; // Prevent multiple clicks

    setSelectedAnswer(index);
    const correct = index === questions[currentQuestion].correctAnswer;
    setIsCorrect(correct);

    if (correct) {
      setScore(score + 1);
    }

    setTimeout(() => {
      if (currentQuestion + 1 < questions.length) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setIsCorrect(null);
      } else {
        setShowResults(true);
        const finalScore = correct ? score + 1 : score;
        const percentage = Math.round((finalScore / questions.length) * 100);
        if (saveQuizScore) {
          saveQuizScore(languageId, levelId, percentage);
        }
        if (percentage >= 60 && completeLesson) {
          completeLesson(languageId, levelId);
        }
      }
    }, 2500); // Wait 2.5s to show feedback
  };

  const handleRetry = () => {
    setCurrentQuestion(0);
    setScore(0);
    setShowResults(false);
    setSelectedAnswer(null);
    setIsCorrect(null);
  };

  const handleNextLevel = () => {
    navigate(`/student/lesson/${languageId}/${parseInt(levelId) + 1}`);
  };

  if (showResults) {
    const percentage = (score / questions.length) * 100;
    let stars = 0;
    if (percentage === 100) stars = 3;
    else if (percentage >= 70) stars = 2;
    else if (percentage >= 40) stars = 1;

    return (
      <div className="quiz-results">
        <h2>¡Quiz Completado!</h2>
        <div className="stars">
          {[1, 2, 3].map((s) => (
            <span key={s} className={s <= stars ? 'star filled' : 'star empty'}>★</span>
          ))}
        </div>
        <p>Puntuación: {score} de {questions.length}</p>
        <div className="result-actions">
          <button className="btn-secondary" onClick={handleRetry}>Reintentar</button>
          {percentage >= 70 && (
            <button className="btn-primary" onClick={handleNextLevel}>Siguiente Nivel</button>
          )}
        </div>
      </div>
    );
  }

  const q = questions[currentQuestion];
  const progress = ((currentQuestion) / questions.length) * 100;

  return (
    <div className="quiz-container">
      <header className="quiz-header">
        <h2>{quiz.title}</h2>
        <div className="progress-bar-container">
          <div className="progress-bar" style={{ width: `${progress}%` }}></div>
        </div>
        <span className="question-counter">Pregunta {currentQuestion + 1} de {questions.length}</span>
      </header>

      <div className="question-card">
        <h3>{q.question}</h3>
        <div className="options-grid">
          {q.options.map((option, idx) => {
            let optionClass = 'option-btn';
            if (selectedAnswer !== null) {
              if (idx === q.correctAnswer) optionClass += ' correct';
              else if (idx === selectedAnswer) optionClass += ' wrong';
              else optionClass += ' disabled';
            }
            return (
              <button 
                key={idx} 
                className={optionClass} 
                onClick={() => handleAnswerClick(idx)}
                disabled={selectedAnswer !== null}
              >
                {option}
              </button>
            );
          })}
        </div>
      </div>

      {selectedAnswer !== null && (
        <div className={`feedback-panel ${isCorrect ? 'feedback-correct' : 'feedback-wrong'}`}>
          <p><strong>{isCorrect ? '¡Correcto!' : 'Incorrecto'}</strong></p>
          <p>{q.explanation}</p>
        </div>
      )}
    </div>
  );
};

export default QuizView;
