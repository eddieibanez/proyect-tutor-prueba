import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { lessonContent } from '../../data/lessonContent';
import { levelData } from '../../data/levelData';
import { useApp } from '../../context/AppContext';
import CodeEditor from './CodeEditor';
import ScratchIDE from './ScratchIDE';
import Chatbot from '../Chatbot/Chatbot';
import { IconBook, IconCode, IconTarget } from '../common/Icons';
import './LessonView.css';

const LessonView = () => {
  const { languageId, levelId } = useParams();
  const navigate = useNavigate();
  const { user, previewMode, completeLesson, customContent } = useApp();
  const [activeTab, setActiveTab] = useState('theory');
  const isPreview = previewMode?.active || user?.isPreview;
  const langKey = languageId?.toLowerCase() || 'arduino';
  const currentNum = parseInt(levelId, 10) || 1;
  const allLevels = levelData[langKey]?.levels || [];
  const exampleCode = languageId === 'python' ? 'print("hola")' : '// codigo';
  const defaultLesson = lessonContent[langKey]?.[currentNum] || {
    title: (allLevels.find(l => l.id === currentNum)?.title) || ('Nivel ' + currentNum),
    theory: '<p>Leccion ' + currentNum + ' de ' + (languageId||'') + '</p>',
    example: { code: exampleCode, explanation: 'Analiza el ejemplo.' },
    practice: { instructions: 'Practica en el editor.', initialCode: '// codigo', expectedOutput: '' },
    challenge: { description: 'Reto del nivel.' }
  };
  const customLesson = customContent?.[langKey + '-' + currentNum];
  const lesson = customLesson || defaultLesson;
  useEffect(() => { setActiveTab('theory'); }, [languageId, levelId]);
  if (!lesson) return <div className="error-msg-container"><h2>Leccion no encontrada</h2></div>;
  const handleNext = () => { if (completeLesson) completeLesson(languageId, levelId); navigate('/student/quiz/' + languageId + '/' + levelId); };
  const handlePrev = () => { if (currentNum > 1) navigate('/student/lesson/' + languageId + '/' + (currentNum - 1)); else navigate('/student/language/' + languageId); };
  const prog = user?.progress?.[langKey] || { lessonsCompleted: 0, currentLevel: 1 };
  const pct = Math.round((prog.lessonsCompleted / 15) * 100);
  const isScratch = langKey === 'scratch';
  return (
    <div className="lesson-layout">
      <aside className="lesson-sidebar">
        <div className="sidebar-header">
          <button className="back-route-btn" onClick={() => navigate('/student/language/' + languageId)}>Volver a la Ruta</button>
          <div className="sidebar-lang-info">
            <span className="lang-icon-badge">{levelData[langKey]?.icon}</span>
            <div><h3>{levelData[langKey]?.name || languageId}</h3><p>{prog.lessonsCompleted}/15 completadas ({pct}%)</p></div>
          </div>
          <div className="sidebar-progress-bar"><div className="sidebar-progress-fill" style={{ width: pct + '%' }}></div></div>
        </div>
        <div className="sidebar-lessons-list">
          <h4>Indice de Lecciones</h4>
          {allLevels.map((lvl) => {
            const done = lvl.id <= prog.lessonsCompleted;
            const cur = lvl.id === currentNum;
            const lk = !isPreview && lvl.id > prog.lessonsCompleted + 1;
            const p2 = done ? 100 : cur ? 50 : 0;
            return (
              <div key={lvl.id} className={'sidebar-lesson-item' + (cur?' current':'') + (done?' completed':'') + (lk?' locked':'')} onClick={() => !lk && navigate('/student/lesson/' + languageId + '/' + lvl.id)}>
                <div className="item-row"><span className="lesson-badge-num">Nivel {lvl.id}</span><span className="lesson-status-icon">{done?'v':cur?'>':lk?'L':'o'}</span></div>
                <div className="lesson-item-title">{lvl.title}</div>
                <div className="lesson-completion-indicator"><div className="completion-bar"><div className="completion-fill" style={{ width: p2 + '%' }}></div></div><span className="completion-text">{p2}%</span></div>
              </div>
            );
          })}
        </div>
      </aside>
      <main className="lesson-main-content">
        <header className="lesson-top-bar">
          <div className="lesson-title-area"><span className="active-level-pill">NIVEL ACTUAL: {levelId} / 15</span><h2>{lesson.title}</h2></div>
          <div className="lesson-quick-actions">
            <button className="nav-btn-secondary" onClick={handlePrev} disabled={currentNum === 1}>Anterior</button>
            <button className="nav-btn-primary" onClick={handleNext}>Ir al Quiz</button>
          </div>
        </header>
        <div className="lesson-tabs">
          <button className={'tab-btn' + (activeTab === 'theory' ? ' active' : '')} onClick={() => setActiveTab('theory')}><IconBook size={16} /><span>Teoria y Concepto</span></button>
          <button className={'tab-btn' + (activeTab === 'example' ? ' active' : '')} onClick={() => setActiveTab('example')}><IconTarget size={16} /><span>Codigo de Ejemplo</span></button>
          <button className={'tab-btn' + (activeTab === 'practice' ? ' active' : '')} onClick={() => setActiveTab('practice')}><IconCode size={16} /><span>Practica Interactiva</span></button>
        </div>
        <div className="lesson-content-body">
          {activeTab === 'theory' && (<div className="tab-pane theory-pane"><div className="theory-card" dangerouslySetInnerHTML={{ __html: lesson.theory }}></div></div>)}
          {activeTab === 'example' && (<div className="tab-pane example-pane"><div className="example-card"><p>{lesson.example?.explanation}</p><pre className="example-code-block"><code>{lesson.example?.code}</code></pre></div></div>)}
          {activeTab === 'practice' && (
            <div className="tab-pane practice-pane">
              <div className="instructions-box"><strong>Instruccion de Practica:</strong><p>{lesson.practice?.instructions}</p></div>
              {isScratch ? (<ScratchIDE language={langKey} initialCode={lesson.practice?.initialCode} lessonData={lesson} />) : (<CodeEditor language={langKey} initialCode={lesson.practice?.initialCode} expectedOutput={lesson.practice?.expectedOutput} lessonData={lesson} />)}
            </div>
          )}
        </div>
      </main>
      <Chatbot languageId={langKey} levelId={currentNum} lessonData={lesson} />
    </div>
  );
};
export default LessonView;