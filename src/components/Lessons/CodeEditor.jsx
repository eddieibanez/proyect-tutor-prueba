import React, { useState, useEffect } from 'react';
import ScratchIDE from './ScratchIDE';
import { analyzeCode, getProgressiveHint } from '../../utils/codeAnalyzer';
import { runSimulation } from '../../utils/simulationEngine';
import './CodeEditor.css';

const CodeEditor = ({ language, initialCode, expectedOutput = '', lessonData = {} }) => {
  const [code, setCode] = useState(initialCode || '');
  const [output, setOutput] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isCompiling, setIsCompiling] = useState(false);
  const [hintLevel, setHintLevel] = useState(0);

  // Estado del análisis inteligente (IA Pedagógica)
  const [analysisResult, setAnalysisResult] = useState({
    isCorrect: false,
    errors: [],
    warnings: [],
    hints: [],
    score: 0,
    feedback: 'Escribe tu código y presiona "▶ Simular y Ejecutar" para analizarlo.',
    severity: 'neutral'
  });

  // Estados visuales de la simulación
  const [simulationState, setSimulationState] = useState({
    ledOn: false,
    ledPin: 13,
    pwmBrightness: 0,
    serialHistory: [],
    spriteX: 0,
    spriteY: 0,
    spriteRot: 90,
    speechBubble: '',
    spriteVisible: true,
    spriteSize: 100,
    pythonVars: {}
  });

  // Actualizar código si cambia initialCode
  useEffect(() => {
    if (initialCode !== undefined) {
      setCode(initialCode);
    }
  }, [initialCode]);

  // Manejo de tabulación en editor de texto
  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const newCode = code.substring(0, start) + '    ' + code.substring(end);
      setCode(newCode);
      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = start + 4;
      }, 0);
    }
  };

  // Ejecución y simulación inteligente
  const handleRun = () => {
    setIsCompiling(true);
    setOutput('Analizando sintaxis, evaluando instrucciones de la lección y compilando simulación...');

    setTimeout(() => {
      // 1. Análisis con IA pedagógica
      const analysis = analyzeCode(code, language, lessonData);
      setAnalysisResult(analysis);

      // 2. Simulación realista
      const sim = runSimulation(code, language, lessonData);
      setSimulationState(prev => ({ ...prev, ...sim.simState }));

      setOutput(sim.output);
      setIsSuccess(analysis.isCorrect && sim.success);
      setIsCompiling(false);
    }, 400);
  };

  // Solicitar nueva pista pedagógica
  const handleRequestHint = () => {
    const nextLevel = (hintLevel + 1) % 3;
    setHintLevel(nextLevel);
    const newHint = getProgressiveHint(language, lessonData, nextLevel);
    setAnalysisResult(prev => ({
      ...prev,
      hints: [newHint, ...(prev.hints || []).filter(h => h !== newHint)].slice(0, 3)
    }));
  };

  const handleReset = () => {
    setCode(initialCode || '');
    setOutput('');
    setIsSuccess(false);
    setHintLevel(0);
    setAnalysisResult({
      isCorrect: false,
      errors: [],
      warnings: [],
      hints: [],
      score: 0,
      feedback: 'Editor restablecido. Escribe tu solución y presiona "▶ Simular y Ejecutar".',
      severity: 'neutral'
    });
    setSimulationState({
      ledOn: false,
      ledPin: 13,
      pwmBrightness: 0,
      serialHistory: [],
      spriteX: 0,
      spriteY: 0,
      spriteRot: 90,
      speechBubble: '',
      spriteVisible: true,
      spriteSize: 100,
      pythonVars: {}
    });
  };

  return (
    <div className="code-editor-wrapper">
      {/* BARRA SUPERIOR DE HERRAMIENTAS */}
      <div className="editor-toolbar">
        <div className="toolbar-left">
          <span className={`lang-badge ${language}`}>{language?.toUpperCase()}</span>
          <span className="editor-hint">
            {language === 'arduino' && 'Compilador estricto C++ & Simulación fiel de circuitos'}
            {language === 'scratch' && 'Entorno de bloques oficial con todas las categorías & escenario interactivo'}
            {language === 'python' && 'Intérprete Python & Análisis de indentación'}
          </span>
        </div>
        <div className="editor-actions">
          <button type="button" className="btn-icon" onClick={handleReset} title="Restablecer código">
            🔄 Reiniciar
          </button>
          <button
            type="button"
            className={`btn-run ${isCompiling ? 'running' : ''}`}
            onClick={handleRun}
            disabled={isCompiling}
          >
            {isCompiling ? '⏳ Analizando...' : '▶ Simular y Ejecutar'}
          </button>
        </div>
      </div>

      {/* ÁREA DE PROGRAMACIÓN + SIMULADOR INTEGRADO */}
      <div className="editor-interactive-split">
        {/* LADO IZQUIERDO: SCRATCH IDE O EDITOR DE TEXTO */}
        <div className="editor-code-pane">
          {language === 'scratch' ? (
            <ScratchIDE code={code} onCodeChange={setCode} />
          ) : (
            <div className="text-mode-container">
              <div className="line-numbers-bar">
                {code.split('\n').map((_, i) => <div key={i}>{i + 1}</div>)}
              </div>
              <textarea
                className="strict-code-textarea"
                value={code}
                onChange={e => setCode(e.target.value)}
                onKeyDown={handleKeyDown}
                spellCheck="false"
                placeholder={
                  language === 'arduino'
                    ? '// Código Arduino C++\nvoid setup() {\n  pinMode(13, OUTPUT);\n}\nvoid loop() {\n}'
                    : '# Código Python\ndef main():\n    print("Hola Mundo")'
                }
              />
            </div>
          )}
        </div>

        {/* LADO DERECHO: SIMULADOR VISUAL EN VIVO */}
        <div className="simulation-preview-pane">
          <div className="sim-pane-header">
            <h4>
              {language === 'arduino' && '⚡ Circuito y Microcontrolador Arduino'}
              {language === 'scratch' && '🎭 Escenario de Ejecución Scratch'}
              {language === 'python' && '📊 Inspector de Memoria y Variables'}
            </h4>
          </div>

          <div className="sim-stage-content">
            {/* SIMULADOR ARDUINO */}
            {language === 'arduino' && (
              <div className="arduino-board-simulator">
                <div className="microcontroller-chip">
                  <span className="chip-label">ATmega328P</span>
                  <div className="chip-legs"></div>
                </div>

                <div className="breadboard-components">
                  <div className="component-led-box">
                    <span className="pin-indicator">Pin Digital: #{simulationState.ledPin}</span>
                    <div
                      className={`simulated-led ${simulationState.ledOn ? 'lit' : 'off'}`}
                      style={{
                        boxShadow: simulationState.ledOn
                          ? `0 0 25px 8px rgba(0, 230, 118, ${Math.max(0.4, simulationState.pwmBrightness / 255)})`
                          : 'none',
                        opacity: simulationState.ledOn
                          ? Math.max(0.4, simulationState.pwmBrightness / 255)
                          : 0.2
                      }}
                    >
                      <div className="led-reflection"></div>
                    </div>
                    <span className="led-status-tag">
                      {simulationState.ledOn
                        ? `ENCENDIDO (${simulationState.pwmBrightness || 255} PWM / 5V)`
                        : 'APAGADO (0V)'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* SIMULADOR SCRATCH */}
            {language === 'scratch' && (
              <div className="scratch-stage-canvas">
                <div className="canvas-grid-lines">
                  <span className="axis-center">(0, 0)</span>
                </div>
                {simulationState.spriteVisible && (
                  <div
                    className="interactive-sprite"
                    style={{
                      transform: `translate(${simulationState.spriteX}px, ${-simulationState.spriteY}px) rotate(${simulationState.spriteRot - 90}deg) scale(${simulationState.spriteSize / 100})`
                    }}
                  >
                    <div className="sprite-avatar">🐱</div>
                    {simulationState.speechBubble && (
                      <div className="sprite-speech-bubble">
                        {simulationState.speechBubble}
                      </div>
                    )}
                  </div>
                )}
                <div className="sprite-telemetry">
                  <span>X: {simulationState.spriteX}</span>
                  <span>Y: {simulationState.spriteY}</span>
                  <span>Rot: {simulationState.spriteRot}°</span>
                  <span>Tam: {simulationState.spriteSize}%</span>
                </div>
              </div>
            )}

            {/* SIMULADOR PYTHON */}
            {language === 'python' && (
              <div className="python-inspector-box">
                <h5>Variables en Memoria (RAM):</h5>
                {Object.keys(simulationState.pythonVars).length === 0 ? (
                  <p className="empty-vars">Ejecuta el código para inspeccionar variables creadas.</p>
                ) : (
                  <div className="vars-table">
                    {Object.entries(simulationState.pythonVars).map(([k, v]) => (
                      <div key={k} className="var-row">
                        <span className="var-name">{k}</span>
                        <span className="var-type">({typeof v})</span>
                        <span className="var-val">= {JSON.stringify(v)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PANEL DE ASISTENTE IA PEDAGÓGICO */}
      <div className={`pedagogical-advice-banner ${analysisResult.severity}`}>
        <div className="advice-icon">
          {analysisResult.severity === 'error' ? '⚠️' : analysisResult.severity === 'warning' ? '💡' : analysisResult.severity === 'success' ? '🌟' : '🤖'}
        </div>
        <div className="advice-body" style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <strong>Tutor IA Pedagógico — Análisis de Código</strong>
            <button
              type="button"
              onClick={handleRequestHint}
              style={{
                background: 'transparent',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '0.75rem',
                cursor: 'pointer'
              }}
            >
              💡 Pedir Pista ({hintLevel + 1}/3)
            </button>
          </div>
          <p style={{ margin: '4px 0 0 0' }}>{analysisResult.feedback}</p>

          {/* Errores con números de línea */}
          {analysisResult.errors && analysisResult.errors.length > 0 && (
            <ul style={{ margin: '6px 0 0 16px', padding: 0, fontSize: '0.85rem' }}>
              {analysisResult.errors.map((err, i) => (
                <li key={i}>{err.msg}</li>
              ))}
            </ul>
          )}

          {/* Pistas pedagógicas (sin dar la solución completa) */}
          {analysisResult.hints && analysisResult.hints.length > 0 && (
            <div style={{ marginTop: '8px', padding: '6px 10px', background: 'rgba(0,0,0,0.1)', borderRadius: '4px' }}>
              <span style={{ fontWeight: 600, fontSize: '0.8rem' }}>Orientación Socrática:</span>
              <ul style={{ margin: '4px 0 0 16px', padding: 0, fontSize: '0.82rem' }}>
                {analysisResult.hints.map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* CONSOLA DE SALIDA ESTÁNDAR */}
      <div className={`output-panel ${isSuccess ? 'success' : output ? 'active' : ''}`}>
        <div className="output-header">
          <span className="output-title">Consola de Salida y Registro de Simulación:</span>
          <span className="output-status">
            {output ? (isSuccess ? '✅ Simulación Fiel y Correcta' : '⚠️ Revisión Requerida') : 'En espera'}
          </span>
        </div>
        <pre className="output-console">{output || 'Presiona "▶ Simular y Ejecutar" para compilar tu algoritmo...'}</pre>
      </div>
    </div>
  );
};

export default CodeEditor;
