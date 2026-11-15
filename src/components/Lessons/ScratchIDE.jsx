import React, { useState } from 'react';
import './ScratchIDE.css';

/**
 * Paleta oficial de categorías y bloques de Scratch con colores oficiales:
 * - Movimiento: #4C97FF
 * - Apariencia: #9966FF
 * - Sonido: #CF63CF
 * - Eventos: #FFBF00
 * - Control: #FFAB19
 * - Sensores: #5CB1D6
 * - Operadores: #59C059
 * - Variables: #FF8C1A
 * - Mis Bloques: #FF6680
 */
export const SCRATCH_CATEGORIES = [
  {
    id: 'motion',
    name: 'Movimiento',
    color: '#4C97FF',
    blocks: [
      { id: 'm1', text: 'mover (10) pasos', template: 'mover (10) pasos', type: 'stack' },
      { id: 'm2', text: 'girar ↷ (15) grados', template: 'girar a la derecha (15) grados', type: 'stack' },
      { id: 'm3', text: 'girar ↶ (15) grados', template: 'girar a la izquierda (15) grados', type: 'stack' },
      { id: 'm4', text: 'ir a posición aleatoria', template: 'ir a posición aleatoria', type: 'stack' },
      { id: 'm5', text: 'ir a x: (0) y: (0)', template: 'ir a x: (0) y: (0)', type: 'stack' },
      { id: 'm6', text: 'deslizar en (1) seg a x: (0) y: (0)', template: 'deslizar en (1) seg a x: (0) y: (0)', type: 'stack' },
      { id: 'm7', text: 'apuntar en dirección (90)', template: 'apuntar en dirección (90)', type: 'stack' },
      { id: 'm8', text: 'sumar a x (10)', template: 'cambiar x por (10)', type: 'stack' },
      { id: 'm9', text: 'fijar x a (0)', template: 'fijar x a (0)', type: 'stack' },
      { id: 'm10', text: 'sumar a y (10)', template: 'cambiar y por (10)', type: 'stack' },
      { id: 'm11', text: 'fijar y a (0)', template: 'fijar y a (0)', type: 'stack' },
      { id: 'm12', text: 'rebotar si toca un borde', template: 'rebotar si toca un borde', type: 'stack' }
    ]
  },
  {
    id: 'looks',
    name: 'Apariencia',
    color: '#9966FF',
    blocks: [
      { id: 'l1', text: 'decir [¡Hola!] por (2) segundos', template: 'decir [¡Hola!] por (2) segundos', type: 'stack' },
      { id: 'l2', text: 'decir [¡Hola!]', template: 'decir [¡Hola!]', type: 'stack' },
      { id: 'l3', text: 'pensar [Hmm...] por (2) segundos', template: 'pensar [Hmm...] por (2) segundos', type: 'stack' },
      { id: 'l4', text: 'cambiar disfraz a [disfraz2]', template: 'cambiar disfraz a [disfraz2]', type: 'stack' },
      { id: 'l5', text: 'siguiente disfraz', template: 'siguiente disfraz', type: 'stack' },
      { id: 'l6', text: 'cambiar fondo a [fondo1]', template: 'cambiar fondo a [fondo1]', type: 'stack' },
      { id: 'l7', text: 'cambiar tamaño por (10)', template: 'cambiar tamaño por (10)', type: 'stack' },
      { id: 'l8', text: 'fijar tamaño al (100) %', template: 'fijar tamaño a (100)%', type: 'stack' },
      { id: 'l9', text: 'mostrar', template: 'mostrar', type: 'stack' },
      { id: 'l10', text: 'esconder', template: 'esconder', type: 'stack' }
    ]
  },
  {
    id: 'sound',
    name: 'Sonido',
    color: '#CF63CF',
    blocks: [
      { id: 's1', text: 'tocar sonido [miau] hasta que termine', template: 'tocar sonido [miau] hasta terminar', type: 'stack' },
      { id: 's2', text: 'iniciar sonido [pop]', template: 'iniciar sonido [pop]', type: 'stack' },
      { id: 's3', text: 'detener todos los sonidos', template: 'detener todos los sonidos', type: 'stack' },
      { id: 's4', text: 'fijar volumen a (100)%', template: 'fijar volumen a (100)%', type: 'stack' }
    ]
  },
  {
    id: 'events',
    name: 'Eventos',
    color: '#FFBF00',
    blocks: [
      { id: 'e1', text: '🚩 al presionar bandera verde', template: 'al presionar bandera verde', type: 'hat' },
      { id: 'e2', text: '⌨️ al presionar tecla [espacio]', template: 'al presionar tecla [espacio]', type: 'hat' },
      { id: 'e3', text: '🖱️ al hacer clic en este objeto', template: 'al hacer clic en este objeto', type: 'hat' },
      { id: 'e4', text: '📨 al recibir [mensaje1]', template: 'al recibir [mensaje1]', type: 'hat' },
      { id: 'e5', text: '📤 enviar [mensaje1]', template: 'enviar [mensaje1]', type: 'stack' },
      { id: 'e6', text: '📤 enviar [mensaje1] y esperar', template: 'enviar [mensaje1] y esperar', type: 'stack' }
    ]
  },
  {
    id: 'control',
    name: 'Control',
    color: '#FFAB19',
    blocks: [
      { id: 'c1', text: 'esperar (1) segundos', template: 'esperar (1) segundos', type: 'stack' },
      { id: 'c2', text: 'repetir (10)', template: 'repetir (10) veces:\n    mover (10) pasos', type: 'c-block' },
      { id: 'c3', text: 'por siempre', template: 'por siempre:\n    mover (10) pasos\n    rebotar si toca un borde', type: 'c-block' },
      { id: 'c4', text: 'si < > entonces', template: 'si <tocando borde> entonces:\n    decir [¡Borde!] por (1) seg', type: 'c-block' },
      { id: 'c5', text: 'si < > entonces / si no', template: 'si <tocando raton> entonces:\n    decir [¡Atrapado!]\nsi no:\n    mover (5) pasos', type: 'c-block' },
      { id: 'c6', text: 'esperar hasta que < >', template: 'esperar hasta que <raton presionado>', type: 'stack' },
      { id: 'c7', text: 'detener [todos]', template: 'detener [todos]', type: 'cap' }
    ]
  },
  {
    id: 'sensing',
    name: 'Sensores',
    color: '#5CB1D6',
    blocks: [
      { id: 'se1', text: '¿tocando [puntero del ratón]?', template: '¿tocando puntero del ratón?', type: 'boolean' },
      { id: 'se2', text: '¿tocando el color [#00FF00]?', template: '¿tocando color [#00FF00]?', type: 'boolean' },
      { id: 'se3', text: 'distancia a [ratón]', template: 'distancia a [ratón]', type: 'reporter' },
      { id: 'se4', text: 'preguntar [¿Cómo te llamas?] y esperar', template: 'preguntar [¿Cómo te llamas?] y esperar', type: 'stack' },
      { id: 'se5', text: '(respuesta)', template: '(respuesta)', type: 'reporter' },
      { id: 'se6', text: '¿tecla [espacio] presionada?', template: '¿tecla [espacio] presionada?', type: 'boolean' },
      { id: 'se7', text: '¿ratón presionado?', template: '¿ratón presionado?', type: 'boolean' },
      { id: 'se8', text: '(posición x del ratón)', template: '(posición x del ratón)', type: 'reporter' },
      { id: 'se9', text: '(posición y del ratón)', template: '(posición y del ratón)', type: 'reporter' },
      { id: 'se10', text: '(cronómetro)', template: '(cronómetro)', type: 'reporter' },
      { id: 'se11', text: 'reiniciar cronómetro', template: 'reiniciar cronómetro', type: 'stack' }
    ]
  },
  {
    id: 'operators',
    name: 'Operadores',
    color: '#59C059',
    blocks: [
      { id: 'o1', text: '( ) + ( )', template: '(A) + (B)', type: 'reporter' },
      { id: 'o2', text: '( ) - ( )', template: '(A) - (B)', type: 'reporter' },
      { id: 'o3', text: '( ) * ( )', template: '(A) * (B)', type: 'reporter' },
      { id: 'o4', text: '( ) / ( )', template: '(A) / (B)', type: 'reporter' },
      { id: 'o5', text: 'número aleatorio entre (1) y (10)', template: 'número aleatorio entre (1) y (10)', type: 'reporter' },
      { id: 'o6', text: '< ( ) > (50) >', template: '(valor) > (50)', type: 'boolean' },
      { id: 'o7', text: '< ( ) < (50) >', template: '(valor) < (50)', type: 'boolean' },
      { id: 'o8', text: '< ( ) = (50) >', template: '(valor) = (50)', type: 'boolean' },
      { id: 'o9', text: '< < > y < > >', template: '<condición 1> y <condición 2>', type: 'boolean' },
      { id: 'o10', text: '< < > o < > >', template: '<condición 1> o <condición 2>', type: 'boolean' },
      { id: 'o11', text: '< no < > >', template: 'no <condición>', type: 'boolean' },
      { id: 'o12', text: 'unir [manzana] y [plátano]', template: 'unir [manzana] y [plátano]', type: 'reporter' },
      { id: 'o13', text: 'longitud de [texto]', template: 'longitud de [texto]', type: 'reporter' }
    ]
  },
  {
    id: 'variables',
    name: 'Variables',
    color: '#FF8C1A',
    blocks: [
      { id: 'v1', text: 'fijar [mi variable] a (0)', template: 'fijar [mi variable] a (0)', type: 'stack' },
      { id: 'v2', text: 'sumar a [mi variable] (1)', template: 'sumar a [mi variable] (1)', type: 'stack' },
      { id: 'v3', text: 'mostrar variable [mi variable]', template: 'mostrar variable [mi variable]', type: 'stack' },
      { id: 'v4', text: 'esconder variable [mi variable]', template: 'esconder variable [mi variable]', type: 'stack' }
    ]
  },
  {
    id: 'myblocks',
    name: 'Mis Bloques',
    color: '#FF6680',
    blocks: [
      { id: 'mb1', text: 'definir [saltar]', template: 'definir [saltar]:\n    cambiar y por (20)\n    esperar (0.2) seg\n    cambiar y por (-20)', type: 'hat' },
      { id: 'mb2', text: '[saltar]', template: '[saltar]', type: 'stack' }
    ]
  }
];

const ScratchIDE = ({ code, onCodeChange }) => {
  const [activeCategory, setActiveCategory] = useState('motion');

  const handleAddBlock = (block) => {
    const formatted = `[${block.template}]`;
    const newCode = code ? `${code}\n${formatted}` : formatted;
    onCodeChange(newCode);
  };

  const handleClearScript = () => {
    onCodeChange('');
  };

  const currentCategoryData = SCRATCH_CATEGORIES.find(c => c.id === activeCategory) || SCRATCH_CATEGORIES[0];

  return (
    <div className="scratch-ide-wrapper">
      {/* Selector lateral de categorías */}
      <div className="scratch-categories-rail">
        {SCRATCH_CATEGORIES.map(cat => (
          <button
            key={cat.id}
            type="button"
            className={`cat-rail-btn ${activeCategory === cat.id ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat.id)}
            title={cat.name}
          >
            <span className="cat-color-dot" style={{ backgroundColor: cat.color }}></span>
            <span className="cat-rail-label">{cat.name}</span>
          </button>
        ))}
      </div>

      {/* Paleta de bloques de la categoría seleccionada */}
      <div className="scratch-palette-pane">
        <div className="palette-header" style={{ borderBottomColor: currentCategoryData.color }}>
          <h4 style={{ color: currentCategoryData.color }}>{currentCategoryData.name}</h4>
          <span className="palette-sub">Haz clic en un bloque para agregarlo a la secuencia</span>
        </div>

        <div className="palette-blocks-grid">
          {currentCategoryData.blocks.map(b => (
            <div
              key={b.id}
              className={`scratch-block-item ${b.type}`}
              style={{ backgroundColor: currentCategoryData.color }}
              onClick={() => handleAddBlock(b)}
            >
              {b.type === 'hat' && <div className="block-hat-curved"></div>}
              {b.type === 'stack' && <div className="block-puzzle-notch"></div>}
              <span className="block-content-text">{b.text}</span>
              {b.type === 'stack' && <div className="block-puzzle-tab"></div>}
            </div>
          ))}
        </div>
      </div>

      {/* Espacio de trabajo (Área de secuencia) */}
      <div className="scratch-workspace-pane">
        <div className="workspace-header">
          <div className="ws-title-group">
            <span className="ws-badge">Espacio de Código</span>
            <span className="ws-hint">Secuencia de bloques conectados</span>
          </div>
          <button type="button" className="btn-clear-blocks" onClick={handleClearScript}>
            🗑️ Limpiar
          </button>
        </div>

        <div className="scratch-script-visual-zone">
          <textarea
            className="scratch-raw-editor"
            value={code}
            onChange={(e) => onCodeChange(e.target.value)}
            placeholder="Selecciona bloques de la izquierda para ir construyendo tu algoritmo de Scratch aquí..."
            rows={10}
            spellCheck="false"
          />
        </div>
      </div>
    </div>
  );
};

export default ScratchIDE;
