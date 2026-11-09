import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Login from './components/Login/Login';
import StudentDashboard from './components/StudentDashboard/StudentDashboard';
import LanguageHub from './components/StudentDashboard/LanguageHub';
import LessonView from './components/Lessons/LessonView';
import QuizView from './components/Quiz/QuizView';
import ExamView from './components/Quiz/ExamView';
import TeacherDashboard from './components/TeacherDashboard/TeacherDashboard';
import StudentMonitor from './components/TeacherDashboard/StudentMonitor';
import ContentEditor from './components/TeacherDashboard/ContentEditor';
import StudentPreview from './components/TeacherDashboard/StudentPreview';
import Navbar from './components/common/Navbar';
import StudentPreviewBanner from './components/common/StudentPreviewBanner';
import Chatbot from './components/Chatbot/Chatbot';

const App = () => {
  const location = useLocation();
  const isLoginRoute = location.pathname === '/';
  const isStudentRoute = location.pathname.startsWith('/student');
  const isTeacherRoute = location.pathname.startsWith('/teacher');

  return (
    <div className="app-container">
      {!isLoginRoute && <Navbar />}
      {!isLoginRoute && <StudentPreviewBanner />}
      <main className={!isLoginRoute ? 'main-content' : ''}>
        <Routes>
          <Route path="/" element={<Login />} />

          {/* Student Routes */}
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/student/language/:languageId" element={<LanguageHub />} />
          <Route path="/student/lesson/:languageId/:levelId" element={<LessonView />} />
          <Route path="/student/quiz/:languageId/:levelId" element={<QuizView />} />
          <Route path="/student/exam/:languageId" element={<ExamView />} />

          {/* Teacher Routes */}
          <Route path="/teacher" element={<TeacherDashboard />} />
          <Route path="/teacher/monitor" element={<StudentMonitor />} />
          <Route path="/teacher/editor" element={<ContentEditor />} />
          <Route path="/teacher/preview" element={<StudentPreview />} />
        </Routes>
      </main>

      {(isStudentRoute || isTeacherRoute) && <Chatbot />}
    </div>
  );
};

export default App;
