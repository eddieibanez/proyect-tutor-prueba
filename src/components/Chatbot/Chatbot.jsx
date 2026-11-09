import React, { useState, useEffect, useRef } from 'react';
import './Chatbot.css';
import { chatbotResponses } from '../../data/chatbotResponses';

const Chatbot = ({ currentLanguage = 'general', currentLevel = 'beginner' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Inicializar chat con saludo
  useEffect(() => {
    if (messages.length === 0) {
      addBotMessage(getRandomResponse(chatbotResponses.greetings));
    }
  }, []);

  // Auto-scroll al último mensaje
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const toggleChat = () => setIsOpen(!isOpen);

  const clearChat = () => {
    setMessages([]);
    setTimeout(() => {
      addBotMessage("He limpiado nuestro chat. ¿En qué más puedo ayudarte hoy? 🤖");
    }, 500);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const addBotMessage = (text) => {
    const newMessage = {
      id: Date.now(),
      text,
      sender: 'bot',
      timestamp: formatTime(new Date())
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const addUserMessage = (text) => {
    const newMessage = {
      id: Date.now(),
      text,
      sender: 'user',
      timestamp: formatTime(new Date())
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const getRandomResponse = (array) => {
    if (!array || array.length === 0) return "¡Ups! No sé qué decir, pero estoy aquí para ayudarte.";
    const randomIndex = Math.floor(Math.random() * array.length);
    return array[randomIndex];
  };

  const analyzeAndRespond = (userText) => {
    const text = userText.toLowerCase();
    
    // 1. Saludos
    if (text.match(/\b(hola|hi|hey|buenas|saludos)\b/)) {
      return getRandomResponse(chatbotResponses.greetings);
    }
    
    // 2. Ayuda general
    if (text.match(/\b(ayuda|help|socorro|no se|que hago)\b/)) {
      return getRandomResponse(chatbotResponses.guidingQuestions);
    }

    // 3. Errores y problemas
    if (text.match(/\b(error|bug|no funciona|falla|mal|roto)\b/)) {
      return getRandomResponse(chatbotResponses.errorHelp) + " " + getRandomResponse(chatbotResponses.debugSteps);
    }

    // 4. Temas específicos (Hints)
    let topicFound = false;
    let response = "";

    // Revisar Arduino
    if (text.includes('arduino') || text.includes('led') || text.includes('sensor') || text.includes('motor')) {
      if (text.includes('led')) response = getRandomResponse(chatbotResponses.topicHints.arduino.led);
      else if (text.includes('sensor')) response = getRandomResponse(chatbotResponses.topicHints.arduino.sensor);
      else if (text.includes('motor')) response = getRandomResponse(chatbotResponses.topicHints.arduino.motor);
      else response = getRandomResponse(chatbotResponses.topicHints.arduino.general);
      topicFound = true;
    }
    
    // Revisar Scratch
    else if (text.includes('scratch') || text.includes('mover') || text.includes('sonido') || text.includes('bandera')) {
      if (text.includes('mover') || text.includes('movimiento') || text.includes('pasos')) response = getRandomResponse(chatbotResponses.topicHints.scratch.movimiento);
      else if (text.includes('sonido') || text.includes('musica')) response = getRandomResponse(chatbotResponses.topicHints.scratch.sonido);
      else if (text.includes('variable')) response = getRandomResponse(chatbotResponses.topicHints.scratch.variables);
      else response = getRandomResponse(chatbotResponses.topicHints.scratch.eventos);
      topicFound = true;
    }

    // Revisar Python
    else if (text.includes('python') || text.includes('variable') || text.includes('lista') || text.includes('funcion') || text.includes('if')) {
      if (text.includes('variable')) response = getRandomResponse(chatbotResponses.topicHints.python.variables);
      else if (text.includes('lista') || text.includes('arreglo')) response = getRandomResponse(chatbotResponses.topicHints.python.listas);
      else if (text.includes('funcion') || text.includes('def')) response = getRandomResponse(chatbotResponses.topicHints.python.funciones);
      else response = getRandomResponse(chatbotResponses.topicHints.python.condicionales);
      topicFound = true;
    }

    if (topicFound) return response;

    // 5. Despedidas
    if (text.match(/\b(adios|chao|bye|nos vemos|hasta luego)\b/)) {
      return getRandomResponse(chatbotResponses.farewell);
    }

    // 6. Aliento por defecto
    if (Math.random() > 0.7) {
      return getRandomResponse(chatbotResponses.encouragement);
    }

    // 7. Pregunta guía por defecto (si no encaja en nada)
    return getRandomResponse(chatbotResponses.guidingQuestions);
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userText = inputValue;
    addUserMessage(userText);
    setInputValue('');
    setIsTyping(true);

    // Simular tiempo de pensamiento del bot
    setTimeout(() => {
      const botResponse = analyzeAndRespond(userText);
      addBotMessage(botResponse);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000); // Entre 1 y 2 segundos
  };

  return (
    <div className="chatbot-container">
      {isOpen && (
        <div className="chatbot-panel">
          <div className="chatbot-header">
            <div className="chatbot-header-title">
              <span className="chatbot-robot-icon">🤖</span>
              CodeBot - Tu Asistente
            </div>
            <div className="chatbot-header-actions">
              <button className="chatbot-clear-btn" onClick={clearChat} title="Limpiar Chat">
                🗑️
              </button>
              <button className="chatbot-close-btn" onClick={toggleChat} title="Minimizar">
                ✖️
              </button>
            </div>
          </div>
          
          <div className="chatbot-messages-area">
            {messages.map((msg) => (
              <div key={msg.id} className={`message-wrapper ${msg.sender}`}>
                <div className="message-bubble">
                  {msg.text}
                </div>
                <div className="message-time">{msg.timestamp}</div>
              </div>
            ))}
            {isTyping && (
              <div className="typing-indicator">
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="chatbot-input-area" onSubmit={handleSend}>
            <input
              type="text"
              className="chatbot-input"
              placeholder="Escribe tu mensaje aquí..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isTyping}
            />
            <button type="submit" className="chatbot-send-btn" disabled={!inputValue.trim() || isTyping}>
              ➤
            </button>
          </form>
        </div>
      )}

      {!isOpen && (
        <button className="chatbot-button" onClick={toggleChat} title="¡Habla con CodeBot!">
          🤖
        </button>
      )}
    </div>
  );
};

export default Chatbot;
