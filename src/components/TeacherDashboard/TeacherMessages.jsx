import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import './TeacherMessages.css';

const TeacherMessages = () => {
  const { user, courses, students, messages, sendMessage, markMessagesAsRead } = useApp();
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || null);
  const [inputText, setInputText] = useState('');

  const activeStudent = students.find(s => s.id === selectedStudentId);
  const assignedCourse = courses.find(c => c.id === activeStudent?.courseId);

  // Mensajes de la conversación actual
  const conversation = messages.filter(m => m.studentId === selectedStudentId);

  const handleSelectStudent = (stId) => {
    setSelectedStudentId(stId);
    markMessagesAsRead(stId);
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeStudent) return;

    sendMessage({
      courseId: activeStudent.courseId,
      studentId: activeStudent.id,
      studentName: `${activeStudent.name} ${activeStudent.lastName || ''}`,
      sender: 'teacher',
      text: inputText.trim()
    });

    setInputText('');
  };

  return (
    <div className="teacher-messages-view">
      <div className="messages-header-bar">
        <h2>💬 Mensajería Directa con Estudiantes</h2>
        <p className="subtitle">Comunícate en tiempo real con tus alumnos para resolver dudas pedagógicas o dar retroalimentación personalizada.</p>
      </div>

      <div className="messages-layout-card">
        {/* LISTA DE ALUMNOS A LA IZQUIERDA */}
        <div className="messages-students-list">
          <div className="students-list-head">
            <span>Conversaciones de Alumnos ({students.length})</span>
          </div>

          <div className="students-scroll-area">
            {students.map(st => {
              const unreadCount = messages.filter(m => m.studentId === st.id && m.sender === 'student' && !m.read).length;
              const isSelected = st.id === selectedStudentId;

              return (
                <div
                  key={st.id}
                  className={`student-msg-item ${isSelected ? 'active' : ''}`}
                  onClick={() => handleSelectStudent(st.id)}
                >
                  <div className="avatar-initials">
                    {st.name.charAt(0)}{st.lastName ? st.lastName.charAt(0) : ''}
                  </div>
                  <div className="msg-preview-info">
                    <div className="name-row">
                      <span className="student-chat-name">{st.name} {st.lastName || ''}</span>
                      {unreadCount > 0 && <span className="unread-dot">{unreadCount}</span>}
                    </div>
                    <span className="student-grade-tag">{st.grade}° Grado • {courses.find(c => c.id === st.courseId)?.code || 'General'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ÁREA DE CHAT A LA DERECHA */}
        <div className="messages-chat-pane">
          {activeStudent ? (
            <>
              <div className="chat-pane-header">
                <div className="chat-user-details">
                  <h3>{activeStudent.name} {activeStudent.lastName || ''}</h3>
                  <p>
                    {assignedCourse?.name} • Grado {activeStudent.grade}° • Estado:{' '}
                    <span className="chat-status">{activeStudent.status || 'Activo'}</span>
                  </p>
                </div>
              </div>

              <div className="chat-messages-history">
                {conversation.length === 0 ? (
                  <div className="no-messages-alert">
                    <p>No hay mensajes previos con este estudiante. Escribe un mensaje abajo para iniciar la conversación.</p>
                  </div>
                ) : (
                  conversation.map(msg => {
                    const isMe = msg.sender === 'teacher';
                    const time = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                    return (
                      <div key={msg.id} className={`chat-bubble-row ${isMe ? 'sent' : 'received'}`}>
                        <div className="chat-bubble">
                          <span className="sender-tag">{isMe ? 'Profesor' : activeStudent.name}</span>
                          <p className="bubble-text">{msg.text}</p>
                          <span className="bubble-time">{time}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <form className="chat-input-bar" onSubmit={handleSend}>
                <input
                  type="text"
                  placeholder={`Escribe un mensaje de orientación para ${activeStudent.name}...`}
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                />
                <button type="submit" className="btn-send-msg">
                  Enviar Mensaje 🚀
                </button>
              </form>
            </>
          ) : (
            <div className="no-student-selected">
              <p>Selecciona un estudiante para abrir la mensajería.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherMessages;
