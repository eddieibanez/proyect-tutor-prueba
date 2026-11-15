import React, { useState, useRef } from 'react';
import './ScratchIDE.css';
import { IconPlay, IconClose } from '../common/Icons';

// Definición oficial de categorías y colores auténticos de Scratch
export const SCRATCH_CATEGORIES = [
  { id: 'motion', name: 'Movimiento', color: '#4C97FF' },
  { id: 'looks', name: 'Apariencia', color: '#9966FF' },
  { id: 'sound', name: 'Sonido', color: '#CF63CF' },
  { id: 'events', name: 'Eventos', color: '#FFBF00' },
  { id: 'control', name: 'Control', color: '#FFAB19' },
  { id: 'sensing', name: 'Sensores', color: '#5CB1D6' },
  { id: 'operators', name: 'Operadores', color: '#59C059' },
  { id: 'variables', name: 'Variables', color: '#FF8C1A' },
  { id: 'myblocks', name: 'Mis Bloques', color: '#FF6680' }
];

// Bloques detallados extraídos de las capturas del usuario
export const OFFICIAL_BLOCKS = {
  motion: [
    { id: 'm_move', shape: 'stack', text: 'mover', params: [{ id: 'steps', val: '10' }], suffix: 'pasos' },
    { id: 'm_turn_right', shape: 'stack', text: 'girar ↷', params: [{ id: 'deg', val: '15' }], suffix: 'grados' },
    { id: 'm_turn_left', shape: 'stack', text: 'girar ↶', params: [{ id: 'deg', val: '15' }], suffix: 'grados' },
    { id: 'm_goto_rand', shape: 'stack', text: 'ir a posición aleatoria' },
    { id: 'm_gotoxy', shape: 'stack', text: 'ir a x:', params: [{ id: 'x', val: '0' }], suffix: 'y:', params2: [{ id: 'y', val: '0' }] },
    { id: 'm_glide', shape: 'stack', text: 'deslizar en', params: [{ id: 'secs', val: '1' }], suffix: 'segs a posición aleatoria' },
    { id: 'm_point_dir', shape: 'stack', text: 'apuntar en dirección', params: [{ id: 'dir', val: '90' }] },
    { id: 'm_point_towards', shape: 'stack', text: 'apuntar hacia puntero del ratón' },
    { id: 'm_bounce', shape: 'stack', text: 'si toca un borde, rebotar' },
    { id: 'm_set_x', shape: 'stack', text: 'dar a x el valor', params: [{ id: 'val', val: '0' }] },
    { id: 'm_change_x', shape: 'stack', text: 'sumar a x', params: [{ id: 'val', val: '10' }] },
    { id: 'm_set_y', shape: 'stack', text: 'dar a y el valor', params: [{ id: 'val', val: '0' }] },
    { id: 'm_change_y', shape: 'stack', text: 'sumar a y', params: [{ id: 'val', val: '10' }] }
  ],
  looks: [
    { id: 'l_say_sec', shape: 'stack', text: 'decir', params: [{ id: 'msg', val: '¡Hola!' }], suffix: 'durante', params2: [{ id: 'sec', val: '2' }], suffix2: 'segundos' },
    { id: 'l_say', shape: 'stack', text: 'decir', params: [{ id: 'msg', val: '¡Hola!' }] },
    { id: 'l_think_sec', shape: 'stack', text: 'pensar', params: [{ id: 'msg', val: 'Umm...' }], suffix: 'durante', params2: [{ id: 'sec', val: '2' }], suffix2: 'segundos' },
    { id: 'l_think', shape: 'stack', text: 'pensar', params: [{ id: 'msg', val: 'Umm...' }] },
    { id: 'l_costume', shape: 'stack', text: 'cambiar disfraz a costume2' },
    { id: 'l_next_costume', shape: 'stack', text: 'siguiente disfraz' },
    { id: 'l_change_size', shape: 'stack', text: 'cambiar tamaño por', params: [{ id: 'val', val: '10' }] },
    { id: 'l_set_size', shape: 'stack', text: 'fijar tamaño al', params: [{ id: 'val', val: '100' }], suffix: '%' },
    { id: 'l_show', shape: 'stack', text: 'mostrar' },
    { id: 'l_hide', shape: 'stack', text: 'esconder' }
  ],
  sound: [
    { id: 's_play_until', shape: 'stack', text: 'tocar sonido Miau hasta que termine' },
    { id: 's_play', shape: 'stack', text: 'iniciar sonido Miau' },
    { id: 's_stop', shape: 'stack', text: 'detener todos los sonidos' },
    { id: 's_change_vol', shape: 'stack', text: 'cambiar volumen en', params: [{ id: 'val', val: '-10' }] },
    { id: 's_set_vol', shape: 'stack', text: 'fijar volumen al', params: [{ id: 'val', val: '100' }], suffix: '%' }
  ],
  events: [
    { id: 'e_when_flag', shape: 'hat', text: 'al hacer clic en ⚑' },
    { id: 'e_when_key', shape: 'hat', text: 'al presionar tecla espacio' },
    { id: 'e_when_click', shape: 'hat', text: 'al hacer clic en este objeto' },
    { id: 'e_when_backdrop', shape: 'hat', text: 'cuando el fondo cambie a fondo1' },
    { id: 'e_broadcast', shape: 'stack', text: 'enviar mensaje1' },
    { id: 'e_broadcast_wait', shape: 'stack', text: 'enviar mensaje1 y esperar' }
  ],
  control: [
    { id: 'c_wait', shape: 'stack', text: 'esperar', params: [{ id: 'sec', val: '1' }], suffix: 'segundos' },
    { id: 'c_repeat', shape: 'c-block', text: 'repetir', params: [{ id: 'times', val: '10' }] },
    { id: 'c_forever', shape: 'c-block', text: 'por siempre' },
    { id: 'c_if', shape: 'c-block', text: 'si <condición> entonces' },
    { id: 'c_if_else', shape: 'c-block', text: 'si <condición> entonces / si no' },
    { id: 'c_wait_until', shape: 'stack', text: 'esperar hasta que <condición>' },
    { id: 'c_stop', shape: 'stack', text: 'detener todos' }
  ],
  sensing: [
    { id: 'sn_touch_mouse', shape: 'boolean', text: '¿tocando el puntero del ratón?' },
    { id: 'sn_touch_color', shape: 'boolean', text: '¿tocando el color verde?' },
    { id: 'sn_ask', shape: 'stack', text: 'preguntar ¿Cómo te llamas? y esperar' },
    { id: 'sn_answer', shape: 'reporter', text: 'respuesta' },
    { id: 'sn_key_pressed', shape: 'boolean', text: '¿tecla espacio presionada?' },
    { id: 'sn_mouse_x', shape: 'reporter', text: 'posición x del ratón' },
    { id: 'sn_mouse_y', shape: 'reporter', text: 'posición y del ratón' }
  ],
  operators: [
    { id: 'op_add', shape: 'reporter', text: '( ) + ( )' },
    { id: 'op_sub', shape: 'reporter', text: '( ) - ( )' },
    { id: 'op_mul', shape: 'reporter', text: '( ) * ( )' },
    { id: 'op_div', shape: 'reporter', text: '( ) / ( )' },
    { id: 'op_random', shape: 'reporter', text: 'número aleatorio entre (1) y (10)' },
    { id: 'op_gt', shape: 'boolean', text: '( ) > 50' },
    { id: 'op_lt', shape: 'boolean', text: '( ) < 50' },
    { id: 'op_eq', shape: 'boolean', text: '( ) = 50' },
    { id: 'op_and', shape: 'boolean', text: '< > y < >' },
    { id: 'op_or', shape: 'boolean', text: '< > o < >' },
    { id: 'op_not', shape: 'boolean', text: 'no < >' },
    { id: 'op_join', shape: 'reporter', text: 'unir manzana plátano' }
  ],
  variables: [
    { id: 'v_val', shape: 'reporter', text: 'mi variable' },
    { id: 'v_set', shape: 'stack', text: 'dar a mi variable el valor', params: [{ id: 'v', val: '0' }] },
    { id: 'v_change', shape: 'stack', text: 'sumar a mi variable', params: [{ id: 'v', val: '1' }] },
    { id: 'v_show', shape: 'stack', text: 'mostrar variable mi variable' },
    { id: 'v_hide', shape: 'stack', text: 'esconder variable mi variable' }
  ],
  myblocks: [
    { id: 'mb_custom', shape: 'hat', text: 'definir bloque personalizado' }
  ]
};

const ScratchIDE = ({ lessonData = {} }) => {
  const [activeCategory, setActiveCategory] = useState('motion');
  const [workspaceBlocks, setWorkspaceBlocks] = useState([]);
  const [zoom, setZoom] = useState(1);
  const [draggingBlock, setDraggingBlock] = useState(null);

  // Estados fieles de simulación del gato de Scratch
  const [catState, setCatState] = useState({
    x: 0,
    y: 0,
    direction: 90, // 90° = apuntando a la derecha
    visible: true,
    size: 100,
    saying: '',
    isRunning: false
  });

  const canvasRef = useRef(null);

  const curCat = SCRATCH_CATEGORIES.find(c => c.id === activeCategory) || SCRATCH_CATEGORIES[0];
  const categoryBlocks = OFFICIAL_BLOCKS[activeCategory] || [];

  // Drag and drop desde la paleta
  const handlePaletteDragStart = (e, b) => {
    setDraggingBlock({
      ...b,
      instanceId: `inst-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      color: curCat.color,
      x: 30,
      y: 30
    });
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleCanvasDrop = (e) => {
    e.preventDefault();
    if (!draggingBlock) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const dropX = (e.clientX - rect.left) / zoom;
    const dropY = (e.clientY - rect.top) / zoom;

    // COMPORTAMIENTO MAGNÉTICO: Si se suelta cerca del final de una pila previa, se acopla magnéticamente
    let finalX = dropX;
    let finalY = dropY;

    if (workspaceBlocks.length > 0) {
      const lastBlock = workspaceBlocks[workspaceBlocks.length - 1];
      const dist = Math.hypot(dropX - lastBlock.x, dropY - (lastBlock.y + 44));
      if (dist < 40) {
        finalX = lastBlock.x;
        finalY = lastBlock.y + 44;
      }
    }

    const updated = workspaceBlocks.filter(b => b.instanceId !== draggingBlock.instanceId);
    setWorkspaceBlocks([...updated, { ...draggingBlock, x: finalX, y: finalY }]);
    setDraggingBlock(null);
  };

  const handleCanvasDragOver = (e) => {
    e.preventDefault();
  };

  const removeBlock = (instId) => {
    setWorkspaceBlocks(prev => prev.filter(b => b.instanceId !== instId));
  };

  // EJECUCIÓN FIEL SEGÚN REGLAS DE SCRATCH
  const handleRunGreenFlag = () => {
    let nextX = catState.x;
    let nextY = catState.y;
    let nextDir = catState.direction;
    let nextSay = '';

    // Ejecutar la secuencia de bloques encadenados
    workspaceBlocks.forEach(blk => {
      if (blk.id === 'm_move') {
        const steps = parseInt(blk.params?.[0]?.val || 10, 10);
        // Si el gato mira a nextDir (90 = derecha, 0 = arriba, 180 = abajo, -90 = izquierda)
        const rad = (nextDir - 90) * (Math.PI / 180);
        nextX += Math.round(steps * Math.cos(rad));
        nextY += Math.round(steps * Math.sin(rad));
      } else if (blk.id === 'm_turn_right') {
        const deg = parseInt(blk.params?.[0]?.val || 15, 10);
        nextDir = (nextDir + deg) % 360;
      } else if (blk.id === 'm_turn_left') {
        const deg = parseInt(blk.params?.[0]?.val || 15, 10);
        nextDir = (nextDir - deg + 360) % 360;
      } else if (blk.id === 'm_gotoxy') {
        nextX = parseInt(blk.params?.[0]?.val || 0, 10);
        nextY = parseInt(blk.params2?.[0]?.val || 0, 10);
      } else if (blk.id === 'm_point_dir') {
        nextDir = parseInt(blk.params?.[0]?.val || 90, 10);
      } else if (blk.id === 'l_say_sec' || blk.id === 'l_say') {
        nextSay = blk.params?.[0]?.val || '¡Hola!';
      }
    });

    // Límites del escenario de Scratch (-240 a 240 en X, -180 a 180 en Y)
    nextX = Math.max(-230, Math.min(230, nextX));
    nextY = Math.max(-170, Math.min(170, nextY));

    setCatState(prev => ({
      ...prev,
      x: nextX,
      y: nextY,
      direction: nextDir,
      saying: nextSay,
      isRunning: true
    }));
  };

  const handleStopAll = () => {
    setCatState(prev => ({
      ...prev,
      saying: '',
      isRunning: false
    }));
  };

  const handleResetStage = () => {
    setCatState({
      x: 0,
      y: 0,
      direction: 90,
      visible: true,
      size: 100,
      saying: '',
      isRunning: false
    });
  };

  return (
    <div className="scratch-pro-ide-wrapper">
      {/* 1. BARRA LATERAL DE CATEGORÍAS AUTÉNTICAS */}
      <aside className="scratch-categories-rail">
        {SCRATCH_CATEGORIES.map(cat => (
          <button
            key={cat.id}
            type="button"
            className={`scratch-cat-item ${activeCategory === cat.id ? 'active' : ''}`}
            style={{ '--cat-color': cat.color }}
            onClick={() => setActiveCategory(cat.id)}
          >
            <span className="cat-circle-dot" style={{ backgroundColor: cat.color }} />
            <span className="cat-name-label">{cat.name}</span>
          </button>
        ))}
      </aside>

      {/* 2. PALETA DE BLOQUES CON FORMA ORIGINAL */}
      <section className="scratch-blocks-palette-area">
        <div className="palette-section-header" style={{ color: curCat.color }}>
          {curCat.name}
        </div>
        <div className="palette-blocks-container">
          {categoryBlocks.map(block => (
            <div
              key={block.id}
              className={`scratch-block ${block.shape}`}
              style={{ backgroundColor: curCat.color }}
              draggable
              onDragStart={e => handlePaletteDragStart(e, block)}
            >
              {/* Orejas de gato / curva superior para sombreros */}
              {block.shape === 'hat' && <div className="hat-notch-top" style={{ backgroundColor: curCat.color }} />}
              {block.shape !== 'reporter' && block.shape !== 'boolean' && block.shape !== 'hat' && (
                <div className="puzzle-tab-top" />
              )}

              <div className="block-content-row">
                <span>{block.text}</span>
                {(block.params || []).map((p, i) => (
                  <span key={i} className="block-param-pill">{p.val}</span>
                ))}
                {block.suffix && <span>{block.suffix}</span>}
                {(block.params2 || []).map((p, i) => (
                  <span key={`p2-${i}`} className="block-param-pill">{p.val}</span>
                ))}
                {block.suffix2 && <span>{block.suffix2}</span>}
              </div>

              {block.shape === 'c-block' && (
                <div className="c-mouth-inner" />
              )}

              {block.shape !== 'reporter' && block.shape !== 'boolean' && (
                <div className="puzzle-tab-bottom" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 3. ESPACIO DE TRABAJO AMPLIO CON ZOOM Y MAGNÉTICA */}
      <main className="scratch-workspace-main">
        <div className="workspace-controls-bar">
          <div className="zoom-btn-group">
            <button type="button" onClick={() => setZoom(z => Math.min(1.8, z + 0.1))} title="Acercar">+</button>
            <span className="zoom-text">{Math.round(zoom * 100)}%</span>
            <button type="button" onClick={() => setZoom(z => Math.max(0.5, z - 0.1))} title="Alejar">-</button>
            <button type="button" onClick={() => setZoom(1)} title="Restablecer zoom 100%">100%</button>
          </div>
          <button type="button" className="btn-clear-blocks" onClick={() => setWorkspaceBlocks([])}>
            Limpiar Pizarra
          </button>
        </div>

        <div
          ref={canvasRef}
          className="scratch-canvas-plane"
          onDrop={handleCanvasDrop}
          onDragOver={handleCanvasDragOver}
        >
          <div
            className="canvas-zoom-container"
            style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
          >
            {workspaceBlocks.length === 0 && (
              <div className="empty-workspace-watermark">
                Arrastra y encadena bloques aquí para programar tu algoritmo
              </div>
            )}

            {workspaceBlocks.map(inst => (
              <div
                key={inst.instanceId}
                className={`workspace-block-placed ${inst.shape}`}
                style={{
                  left: `${inst.x}px`,
                  top: `${inst.y}px`,
                  backgroundColor: inst.color || '#4C97FF'
                }}
              >
                {inst.shape === 'hat' && <div className="hat-notch-top" style={{ backgroundColor: inst.color || '#4C97FF' }} />}
                {inst.shape !== 'reporter' && inst.shape !== 'boolean' && inst.shape !== 'hat' && (
                  <div className="puzzle-tab-top" />
                )}

                <div className="block-content-row">
                  <span>{inst.text}</span>
                  {(inst.params || []).map((p, i) => (
                    <input
                      key={i}
                      type="text"
                      className="block-input-param"
                      defaultValue={p.val}
                      onClick={e => e.stopPropagation()}
                    />
                  ))}
                  {inst.suffix && <span>{inst.suffix}</span>}
                </div>

                {inst.shape === 'c-block' && <div className="c-mouth-inner" />}

                {inst.shape !== 'reporter' && inst.shape !== 'boolean' && (
                  <div className="puzzle-tab-bottom" />
                )}

                <button
                  type="button"
                  className="btn-delete-block"
                  onClick={() => removeBlock(inst.instanceId)}
                  title="Eliminar bloque"
                >
                  <IconClose size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* 4. ESCENARIO DEL GATO OFICIAL Y FÍSICA DE MOVIMIENTO */}
      <aside className="scratch-stage-section">
        <div className="stage-control-bar">
          <button
            type="button"
            className="btn-green-flag"
            onClick={handleRunGreenFlag}
            title="Al hacer clic en bandera verde (Ejecutar)"
          >
            <span style={{ color: '#00E676', fontSize: '1.2rem' }}>⚑</span>
          </button>
          <button
            type="button"
            className="btn-red-stop"
            onClick={handleStopAll}
            title="Detener todo"
          >
            <span style={{ color: '#FF5252', fontSize: '1.2rem' }}>⏹</span>
          </button>
          <button
            type="button"
            className="btn-reset-pos"
            onClick={handleResetStage}
            title="Centrar personaje en (0, 0)"
          >
            Reiniciar Posición
          </button>
        </div>

        {/* Lienzo del escenario */}
        <div className="stage-screen-canvas">
          <div className="stage-axis-cross">
            <span className="origin-marker">(0, 0)</span>
          </div>

          {catState.visible && (
            <div
              className="scratch-cat-sprite"
              style={{
                left: `calc(50% + ${catState.x}px)`,
                top: `calc(50% - ${catState.y}px)`,
                transform: `translate(-50%, -50%) rotate(${catState.direction - 90}deg) scale(${catState.size / 100})`
              }}
            >
              {/* Bocadillo de diálogo si el bloque "decir" fue invocado */}
              {catState.saying && (
                <div className="sprite-speech-bubble">
                  {catState.saying}
                </div>
              )}

              {/* Dibujo SVG fiel del gato de Scratch */}
              <svg width="48" height="48" viewBox="0 0 100 100" fill="none">
                <circle cx="50" cy="55" r="32" fill="#FFA500" stroke="#000" strokeWidth="3" />
                {/* Orejas */}
                <polygon points="25,32 18,10 40,25" fill="#FFA500" stroke="#000" strokeWidth="3" />
                <polygon points="75,32 82,10 60,25" fill="#FFA500" stroke="#000" strokeWidth="3" />
                {/* Ojos */}
                <ellipse cx="38" cy="50" rx="6" ry="8" fill="#FFFFFF" stroke="#000" strokeWidth="2" />
                <ellipse cx="62" cy="50" rx="6" ry="8" fill="#FFFFFF" stroke="#000" strokeWidth="2" />
                <circle cx="40" cy="50" r="3" fill="#000" />
                <circle cx="64" cy="50" r="3" fill="#000" />
                {/* Nariz y bigotes */}
                <polygon points="50,58 46,63 54,63" fill="#FF4081" />
                <line x1="25" y1="58" x2="10" y2="56" stroke="#000" strokeWidth="2" />
                <line x1="25" y1="64" x2="10" y2="66" stroke="#000" strokeWidth="2" />
                <line x1="75" y1="58" x2="90" y2="56" stroke="#000" strokeWidth="2" />
                <line x1="75" y1="64" x2="90" y2="66" stroke="#000" strokeWidth="2" />
                {/* Sonrisa */}
                <path d="M44 68 Q50 74 56 68" stroke="#000" strokeWidth="2" fill="none" />
              </svg>
            </div>
          )}
        </div>

        {/* Telemetría del objeto */}
        <div className="stage-telemetry-bar">
          <span>X: <strong>{catState.x}</strong></span>
          <span>Y: <strong>{catState.y}</strong></span>
          <span>Dirección: <strong>{catState.direction}°</strong></span>
          <span>Tamaño: <strong>{catState.size}%</strong></span>
        </div>
      </aside>
    </div>
  );
};

export default ScratchIDE;
