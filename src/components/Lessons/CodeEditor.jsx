import React, { useState, useEffect, useRef } from 'react';
import './CodeEditor.css';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_CHATBOT_API_KEY || '';

const CodeEditor = ({ language = 'arduino', initialCode = '', expectedOutput = '', lessonData = {} }) => {
  const [code, setCode] = useState(initialCode || '');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [aiGuidance, setAiGuidance] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => { if (initialCode !== undefined) setCode(initialCode); }, [initialCode]);

  const getAutoIndent = (value, selectionStart) => {
    const lines = value.substring(0, selectionStart).split('\n');
    const lastLine = lines[lines.length - 1] || '';
    const indentMatch = lastLine.match(/^(\s*)/);
    let indent = indentMatch ? indentMatch[1] : '';
    const trimmed = lastLine.trimEnd();
    if (trimmed.endsWith(':') || trimmed.endsWith('{')) indent += '    ';
    return indent;
  };

  const handleKeyDown = (e) => {
    const ta = e.target;
    const { selectionStart, selectionEnd, value } = ta;
    if (e.key === 'Tab') {
      e.preventDefault();
      const updated = value.substring(0, selectionStart) + '    ' + value.substring(selectionEnd);
      setCode(updated);
      setTimeout(() => { ta.selectionStart = ta.selectionEnd = selectionStart + 4; }, 0);
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      const indent = getAutoIndent(value, selectionStart);
      const updated = value.substring(0, selectionStart) + '\n' + indent + value.substring(selectionEnd);
      setCode(updated);
      setTimeout(() => { ta.selectionStart = ta.selectionEnd = selectionStart + 1 + indent.length; }, 0);
      return;
    }
    const openClose = { '(': ')', '[': ']', '{': '}' };
    if (openClose[e.key]) {
      e.preventDefault();
      const closing = openClose[e.key];
      const selected = value.substring(selectionStart, selectionEnd);
      const updated = value.substring(0, selectionStart) + e.key + selected + closing + value.substring(selectionEnd);
      setCode(updated);
      setTimeout(() => { ta.selectionStart = ta.selectionEnd = selectionStart + 1; }, 0);
      return;
    }
  };

  const simulateArduino = (src) => {
    const lines = [];
    let ledState = false;
    let pwm = 0;
    if (!src.includes('void setup') || !src.includes('void loop')) {
      return { output: '[ERROR] Se requieren las funciones setup() y loop() en Arduino.', success: false };
    }
    if (src.includes('Serial.begin')) lines.push('[Serial] Puerto inicializado.');
    const printMatches = src.match(/Serial\.print(ln)?\s*\(\s*["']([^"']*)["']\s*\)/g) || [];
    printMatches.forEach(m => { const val = m.match(/["']([^"']*)["']/); if (val) lines.push('[Serial] ' + val[1]); });
    if (src.includes('digitalWrite') && src.includes('HIGH')) { ledState = true; lines.push('[Pin] LED ENCENDIDO (HIGH)'); }
    if (src.includes('digitalWrite') && src.includes('LOW')) { ledState = false; lines.push('[Pin] LED APAGADO (LOW)'); }
    const analogMatch = src.match(/analogWrite\s*\(\s*\d+\s*,\s*(\d+)\s*\)/);
    if (analogMatch) { pwm = parseInt(analogMatch[1]); lines.push('[PWM] Valor = ' + pwm + ' (' + Math.round(pwm/255*100) + '%)'); }
    lines.push('[OK] Simulacion completada.');
    return { output: lines.join('\n'), success: true };
  };

  const simulatePython = (src) => {
    const lines = [];
    const printMatches = src.match(/print\s*\(([^)]+)\)/g) || [];
    printMatches.forEach(m => {
      const inner = m.replace(/^print\s*\(/, '').replace(/\)$/, '').trim();
      const strMatch = inner.match(/^["'](.*)["']$/);
      lines.push(strMatch ? strMatch[1] : '[expr] ' + inner);
    });
    if (!src.includes('def ') && src.trim() === '') return { output: '[ERROR] El archivo esta vacio.', success: false };
    if (lines.length === 0) lines.push('[OK] Programa ejecutado. Resultado: sin salida de consola.');
    return { output: lines.join('\n'), success: true };
  };

  const handleRun = () => {
    setIsRunning(true);
    setOutput('Compilando y simulando ' + (language||'').toUpperCase() + '...');
    setAiGuidance('');
    setTimeout(() => {
      let result;
      if (language === 'arduino') result = simulateArduino(code);
      else if (language === 'python') result = simulatePython(code);
      else result = { output: 'Simulacion Scratch completada.', success: true };
      setOutput(result.output);
      setIsSuccess(result.success);
      setIsRunning(false);
      if (!result.success || (expectedOutput && !result.output.includes(expectedOutput.trim()))) {
        callGeminiForGuidance(result.output);
      }
    }, 600);
  };

  const callGeminiForGuidance = async (executionOutput) => {
    if (!GEMINI_API_KEY) return;
    setIsAiLoading(true);
    try {
      const prompt = 'Eres un tutor de programacion pedagogico. El estudiante tiene este codigo en ' + (language||'') + ':\n' + code + '\n\nSalida obtenida:\n' + executionOutput + '\n\nInstrucciones de la leccion: ' + (lessonData?.practice?.instructions || '') + '\n\nDa una pista de maximo 2 oraciones sin revelar la solucion completa. Habla en espanol amigable.';
      const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + GEMINI_API_KEY;
      const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }], generationConfig: { temperature: 0.6, maxOutputTokens: 200 } }) });
      if (res.ok) {
        const data = await res.json();
        setAiGuidance(data.candidates?.[0]?.content?.parts?.[0]?.text || '');
      }
    } catch {}
    finally { setIsAiLoading(false); }
  };

  const handleReset = () => { setCode(initialCode || ''); setOutput(''); setIsSuccess(false); setAiGuidance(''); };

  const lineCount = (code || '').split('\n').length;

  const getPlaceholder = () => {
    if (language === 'python') return '# Codigo Python\ndef main():\n    print("Hola Mundo")\n\nmain()';
    return '// Codigo Arduino C++\nvoid setup() {\n  pinMode(13, OUTPUT);\n}\nvoid loop() {\n  digitalWrite(13, HIGH);\n  delay(1000);\n}';
  };

  return (
    <div className="vscode-editor-wrapper">
      <div className="vscode-titlebar">
        <div className="vscode-tabs">
          <div className="vscode-tab active">
            <span className="tab-dot"></span>
            <span>{language === 'python' ? 'main.py' : language === 'arduino' ? 'sketch.ino' : 'program.scratch'}</span>
          </div>
        </div>
        <div className="vscode-toolbar-actions">
          <button className="vsc-action-btn" onClick={handleReset} title="Reiniciar codigo">Reiniciar</button>
          <button className={'vsc-run-btn' + (isRunning ? ' running' : '')} onClick={handleRun} disabled={isRunning}>
            {isRunning ? 'Compilando...' : 'Ejecutar'}
          </button>
        </div>
      </div>
      <div className="vscode-editor-body">
        <div className="vscode-line-numbers">
          {Array.from({ length: Math.max(lineCount, 1) }, (_, i) => (
            <div key={i} className="line-num">{i + 1}</div>
          ))}
        </div>
        <textarea
          ref={textareaRef}
          className="vscode-textarea"
          value={code}
          onChange={e => setCode(e.target.value)}
          onKeyDown={handleKeyDown}
          spellCheck="false"
          autoCorrect="off"
          autoCapitalize="off"
          placeholder={getPlaceholder()}
        />
      </div>
      <div className="vscode-statusbar">
        <span>Ln {lineCount}</span>
        <span>{(language||'').toUpperCase()}</span>
        <span>UTF-8</span>
        <span className={'status-dot' + (isSuccess ? ' success' : '')}>{isSuccess ? 'OK' : 'Editando'}</span>
      </div>
      <div className="vscode-terminal-panel">
        <div className="terminal-header">
          <span>CONSOLA DE SALIDA</span>
        </div>
        <div className="terminal-output">
          {output ? (
            <pre className={'terminal-text' + (output.includes('[ERROR]') ? ' error' : isSuccess ? ' success' : '')}>{output}</pre>
          ) : (
            <span className="terminal-placeholder">Presiona Ejecutar para ver la salida...</span>
          )}
          {(isAiLoading || aiGuidance) && (
            <div className="ai-guidance-box">
              <span className="ai-label">Tutor IA:</span>
              {isAiLoading ? <span className="ai-loading">Analizando tu codigo...</span> : <span className="ai-text">{aiGuidance}</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default CodeEditor;