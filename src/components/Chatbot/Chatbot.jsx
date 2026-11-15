import React, { useState, useEffect, useRef } from 'react';
import { IconChat, IconClose, IconSend } from '../common/Icons';
import './Chatbot.css';

const GEMINI_API_KEY = import.meta.env.VITE_CHATBOT_API_KEY || import.meta.env.VITE_GEMINI_API_KEY || '';

const Chatbot = ({ languageId = 'general', levelId = 1, lessonData = null }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    setMessages([
      {
        id: 'welcome',
        sender: 'bot',
        text: `¡Hola! Soy tu tutor pedagógico de IA para ${String(languageId).toUpperCase()} (Nivel ${levelId}). No te daré la solución directa ni el código terminado, pero sí te guiaré paso a paso con preguntas y recordatorios para que descubras el camino correcto. ¿En qué parte tienes dudas?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  }, [languageId, levelId]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const toggleChat = () => setIsOpen(!isOpen);

  const callGeminiAPI = async (userPrompt, chatHistory) => {
    if (!GEMINI_API_KEY) {
      return `He analizado tu duda en ${languageId}. Recuerda revisar la estructura de tus instrucciones, la indentación y los tipos de datos que estás manipulando.`;
    }

    try {
      const lessonTitle = lessonData?.title || `Nivel ${levelId}`;
      const lessonInstructions = lessonData?.practice?.instructions || '';
      const lessonChallenge = lessonData?.challenge?.description || '';

      const systemInstruction = `Eres un tutor de programación experto y pedagógico para estudiantes de primaria y secundaria en CodeCraft Academy.
El estudiante está actualmente en la lección: "${lessonTitle}", Nivel: ${levelId} de ${languageId.toUpperCase()}.
Instrucciones de la lección: "${lessonInstructions}".
Desafío: "${lessonChallenge}".

REGLAS CRÍTICAS PEDAGÓGICAS:
1. NUNCA des el código resuelto ni la respuesta final completa.
2. Utiliza el método socrático: haz preguntas guía, proporciona recordatorios conceptuales y divide el problema en partes más simples.
3. Sé motivador, claro, breve y conciso (máximo 2 párrafos cortos).
4. Responde en español amigable.
5. Si preguntan sobre sintaxis, explica la estructura general con un ejemplo DIFERENTE al del ejercicio de la lección.`;

      const contents = [
        ...chatHistory.slice(-4).map(m => ({
          role: m.sender === 'user' ? 'user' : 'model',
          parts: [{ text: m.text }]
        })),
        {
          role: 'user',
          parts: [{ text: userPrompt }]
        }
      ];

      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemInstruction }] },
          contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 350
          }
        })
      });

      if (!res.ok) {
        throw new Error(`Status ${res.status}`);
      }

      const data = await res.json();
      const botReply = data.candidates?.[0]?.content?.parts?.[0]?.text;
      return botReply || 'Pensemos juntos: ¿qué crees que debe ocurrir en el primer paso de tu algoritmo?';
    } catch (err) {
      console.warn('Error al consultar Gemini Chatbot API:', err);
      return `¡Buena pregunta! Para resolver este nivel en ${languageId.toUpperCase()}, recuerda descomponer tu problema en pasos pequeños: 1) ¿Qué datos o pines necesitas configurar al inicio? 2) ¿Cuál es la condición que debe evaluarse? ¡Intenta escribir esa primera parte!`;
    }
  };

  const handleSend = async (e) => {
    e?.preventDefault();
    const clean = inputValue.trim();
    if (!clean || isTyping) return;

    const userMsg = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: clean,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    try {
      const replyText = await callGeminiAPI(clean, messages);
      setMessages(prev => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          sender: 'bot',
          text: 'Hubo una breve interrupción en la conexión. ¿Qué parte de tu código o algoritmo quieres revisar?',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="chatbot-wrapper">
      {!isOpen && (
        <button
          type="button"
          className="chatbot-floating-toggle"
          onClick={toggleChat}
          title="Abrir Tutor IA de Programación"
          aria-label="Abrir Asistente Tutor IA"
        >
          <IconChat size={22} color="#ffffff" />
          <span className="chatbot-pill-label">Tutor IA</span>
        </button>
      )}

      {isOpen && (
        <div className="chatbot-window-panel">
          <header className="chatbot-window-header">
            <div className="chatbot-header-title">
              <span className="chatbot-ai-status-dot"></span>
              <div>
                <h4>Tutor Pedagógico IA</h4>
                <p className="chatbot-header-sub">{String(languageId).toUpperCase()} • Nivel {levelId}</p>
              </div>
            </div>
            <button type="button" className="chatbot-close-btn" onClick={toggleChat} title="Cerrar chat">
              <IconClose size={18} color="currentColor" />
            </button>
          </header>

          <div className="chatbot-messages-area">
            {messages.map(m => (
              <div key={m.id} className={`chat-bubble ${m.sender === 'user' ? 'bubble-user' : 'bubble-bot'}`}>
                <div className="chat-bubble-content">{m.text}</div>
                <span className="chat-bubble-time">{m.timestamp}</span>
              </div>
            ))}
            {isTyping && (
              <div className="chat-bubble bubble-bot typing-indicator">
                <span></span><span></span><span></span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="chatbot-input-bar" onSubmit={handleSend}>
            <input
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder="Pregúntale al tutor sobre tu algoritmo..."
              disabled={isTyping}
            />
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
