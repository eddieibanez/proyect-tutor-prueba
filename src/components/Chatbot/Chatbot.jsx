import React, { useState, useEffect, useRef } from 'react';
import './Chatbot.css';
import { IconChat, IconClose, IconSend } from '../common/Icons';

const Chatbot = ({ languageId = 'general', levelId = 1, lessonData = null }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const apiKey = import.meta.env.VITE_CHATBOT_API_KEY || import.meta.env.VITE_GEMINI_API_KEY || '';

  useEffect(() => {
    setMessages([{
      id: 'welcome',
      sender: 'bot',
      text: 'Hola! Soy tu tutor pedagogico de IA para ' + (languageId||'') + ' (Nivel ' + levelId + '). No te dare la solucion directa, pero si te guiare con preguntas y recordatorios. En que parte tienes dudas?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
  }, [languageId, levelId]);

  useEffect(() => {
    if (messagesEndRef.current) messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const toggleChat = () => setIsOpen(!isOpen);

  const callGeminiAPI = async (userPrompt, chatHistory) => {
    if (!apiKey) {
      return 'He revisado tu consulta sobre ' + (languageId||'') + '. Recuerda verificar la sintaxis, el orden de las instrucciones y la logica de tu solucion.';
    }
    try {
      const lessonTitle = lessonData?.title || '';
      const lessonInstructions = lessonData?.practice?.instructions || '';
      const lessonChallenge = lessonData?.challenge?.description || '';
      const systemInstruction = 'Eres un tutor de programacion experto y pedagogico para estudiantes de primaria y secundaria en CodeCraft Academy. ' +
        'El estudiante esta en la leccion: ' + lessonTitle + ', Nivel: ' + levelId + '. ' +
        'Instrucciones: ' + lessonInstructions + '. Desafio: ' + lessonChallenge + '. ' +
        'REGLAS: 1) NUNCA des el codigo resuelto ni la respuesta final. ' +
        '2) Usa el metodo socratico: haz preguntas guia, da pistas progresivas, recuerda conceptos clave. ' +
        '3) Se motivador, claro y breve (max 2 parrafos). 4) Responde en espanol amigable. ' +
        '5) Si preguntan sobre sintaxis, explica la estructura general con un ejemplo DIFERENTE al del ejercicio.';
      const contents = [
        ...chatHistory.slice(-6).map(m => ({
          role: m.sender === 'user' ? 'user' : 'model',
          parts: [{ text: m.text }]
        })),
        { role: 'user', parts: [{ text: userPrompt }] }
      ];
      const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + apiKey;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemInstruction }] },
          contents,
          generationConfig: { temperature: 0.7, maxOutputTokens: 350 }
        })
      });
      if (!res.ok) throw new Error('Status ' + res.status);
      const data = await res.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Pensemos juntos: que crees que debe ocurrir en el primer paso?';
    } catch (err) {
      return 'Excelente pregunta! Para ' + (languageId||'') + ', recuerda descomponer tu problema en pasos pequenos: 1) Que variables necesitas? 2) Cual es la condicion? Intenta escribir esa primera parte!';
    }
  };

  const handleSend = async (e) => {
    e?.preventDefault();
    const clean = inputValue.trim();
    if (!clean || isTyping) return;
    const userMsg = { id: 'msg-' + Date.now(), sender: 'user', text: clean, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);
    try {
      const replyText = await callGeminiAPI(clean, messages);
      setMessages(prev => [...prev, { id: 'bot-' + Date.now(), sender: 'bot', text: replyText, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    } catch {
      setMessages(prev => [...prev, { id: 'bot-err-' + Date.now(), sender: 'bot', text: 'Hubo una breve interrupcion. Que parte de tu codigo quieres revisar?', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="chatbot-wrapper">
      {!isOpen && (
        <button className="chatbot-floating-toggle" onClick={toggleChat} title="Abrir Tutor IA" aria-label="Abrir Asistente Tutor IA">
          <IconChat size={24} color="#ffffff" />
          <span className="chatbot-pill-label">Tutor IA</span>
        </button>
      )}
      {isOpen && (
        <div className="chatbot-window-panel">
          <header className="chatbot-window-header">
            <div className="chatbot-header-title">
              <span className="chatbot-ai-status-dot"></span>
              <div>
                <h4>Tutor Pedagogico IA</h4>
                <p className="chatbot-header-sub">{(languageId||'').toUpperCase()} - Nivel {levelId}</p>
              </div>
            </div>
            <button className="chatbot-close-btn" onClick={toggleChat} title="Cerrar chat">
              <IconClose size={18} color="currentColor" />
            </button>
          </header>
          <div className="chatbot-messages-area">
            {messages.map(m => (
              <div key={m.id} className={'chat-bubble ' + (m.sender === 'user' ? 'bubble-user' : 'bubble-bot')}>
                <div className="chat-bubble-content">{m.text}</div>
                <span className="chat-bubble-time">{m.timestamp}</span>
              </div>
            ))}
            {isTyping && (
              <div className="chat-bubble bubble-bot typing-indicator">
                <span>.</span><span>.</span><span>.</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <form className="chatbot-input-bar" onSubmit={handleSend}>
            <input type="text" value={inputValue} onChange={e => setInputValue(e.target.value)} placeholder="Preguntale al tutor sobre tu algoritmo..." disabled={isTyping} />
            <button type="submit" disabled={!inputValue.trim() || isTyping} className="chatbot-send-btn">
              <IconSend size={18} color="#ffffff" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
export default Chatbot;