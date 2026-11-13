import React, { useState, useRef, useCallback } from 'react';
import './ScratchIDE.css';

// Categorias de bloques con colores oficiales de Scratch
const CATEGORIES = [
  { id: 'motion', label: 'Movimiento', color: '#4C97FF' },
  { id: 'looks', label: 'Apariencia', color: '#9966FF' },
  { id: 'sound', label: 'Sonido', color: '#CF63CF' },
  { id: 'events', label: 'Eventos', color: '#FFBF00' },
  { id: 'control', label: 'Control', color: '#FFAB19' },
  { id: 'sensing', label: 'Sensores', color: '#5CB1D6' },
  { id: 'operators', label: 'Operadores', color: '#59C059' },
  { id: 'variables', label: 'Variables', color: '#FF8C1A' },
  { id: 'myblocks', label: 'Mis Bloques', color: '#FF6680' },
];

const BLOCKS_BY_CATEGORY = {
  motion: [
    { id: 'move', type: 'stack', label: 'mover', params: [{ type: 'num', val: '10' }], suffix: 'pasos' },
    { id: 'turn_right', type: 'stack', label: 'girar', params: [{ type: 'num', val: '15' }], suffix: 'grados' },
    { id: 'turn_left', type: 'stack', label: 'girar izq', params: [{ type: 'num', val: '15' }], suffix: 'grados' },
    { id: 'goto', type: 'stack', label: 'ir a posicion aleatoria' },
    { id: 'gotoxy', type: 'stack', label: 'ir a x:', params: [{ type: 'num', val: '0' }], suffix: 'y:', params2: [{ type: 'num', val: '0' }] },
    { id: 'glide', type: 'stack', label: 'deslizar en', params: [{ type: 'num', val: '1' }], suffix: 'segs a posicion aleatoria' },
    { id: 'setdir', type: 'stack', label: 'apuntar en direccion', params: [{ type: 'num', val: '90' }] },
    { id: 'bounce', type: 'stack', label: 'si toca un borde, rebotar' },
    { id: 'setx', type: 'stack', label: 'fijar x a', params: [{ type: 'num', val: '0' }] },
    { id: 'sety', type: 'stack', label: 'fijar y a', params: [{ type: 'num', val: '0' }] },
    { id: 'changex', type: 'stack', label: 'cambiar x en', params: [{ type: 'num', val: '10' }] },
    { id: 'changey', type: 'stack', label: 'cambiar y en', params: [{ type: 'num', val: '10' }] },
  ],
  looks: [
    { id: 'say', type: 'stack', label: 'decir', params: [{ type: 'text', val: 'Hola!' }], suffix: 'durante', params2: [{ type: 'num', val: '2' }], suffix2: 'segundos' },
    { id: 'sayforever', type: 'stack', label: 'decir', params: [{ type: 'text', val: 'Hola!' }] },
    { id: 'think', type: 'stack', label: 'pensar', params: [{ type: 'text', val: 'Hmm...' }], suffix: 'durante', params2: [{ type: 'num', val: '2' }], suffix2: 'segundos' },
    { id: 'costume', type: 'stack', label: 'cambiar disfraz a', params: [{ type: 'text', val: 'disfraz2' }] },
    { id: 'nextcostume', type: 'stack', label: 'siguiente disfraz' },
    { id: 'setsize', type: 'stack', label: 'fijar tamano a', params: [{ type: 'num', val: '100' }] },
    { id: 'changesize', type: 'stack', label: 'cambiar tamano en', params: [{ type: 'num', val: '10' }] },
    { id: 'show', type: 'stack', label: 'mostrar' },
    { id: 'hide', type: 'stack', label: 'esconder' },
  ],
  sound: [
    { id: 'playsound', type: 'stack', label: 'tocar sonido', params: [{ type: 'text', val: 'Miau' }], suffix: 'hasta que termine' },
    { id: 'stopsounds', type: 'stack', label: 'detener todos los sonidos' },
    { id: 'changevolume', type: 'stack', label: 'cambiar volumen en', params: [{ type: 'num', val: '-10' }] },
    { id: 'setvolume', type: 'stack', label: 'fijar volumen a', params: [{ type: 'num', val: '100' }] },
  ],
  events: [
    { id: 'whenflag', type: 'hat', label: 'al presionar bandera verde' },
    { id: 'whenkey', type: 'hat', label: 'al presionar tecla', params: [{ type: 'text', val: 'espacio' }] },
    { id: 'whenclick', type: 'hat', label: 'al hacer clic en este objeto' },
    { id: 'whenbackdrop', type: 'hat', label: 'cuando el fondo cambie a', params: [{ type: 'text', val: 'fondo1' }] },
    { id: 'broadcast', type: 'stack', label: 'enviar', params: [{ type: 'text', val: 'mensaje1' }] },
    { id: 'broadcastwait', type: 'stack', label: 'enviar', params: [{ type: 'text', val: 'mensaje1' }], suffix: 'y esperar' },
  ],
  control: [
    { id: 'wait', type: 'stack', label: 'esperar', params: [{ type: 'num', val: '1' }], suffix: 'segundos' },
    { id: 'repeat', type: 'c', label: 'repetir', params: [{ type: 'num', val: '10' }] },
    { id: 'forever', type: 'c', label: 'por siempre' },
    { id: 'if', type: 'c', label: 'si', params: [{ type: 'bool', val: '' }], suffix: 'entonces' },
    { id: 'ifelse', type: 'c', label: 'si', params: [{ type: 'bool', val: '' }], suffix: 'entonces / si no' },
    { id: 'waituntil', type: 'stack', label: 'esperar hasta que', params: [{ type: 'bool', val: '' }] },
    { id: 'repeatuntil', type: 'c', label: 'repetir hasta que', params: [{ type: 'bool', val: '' }] },
    { id: 'stop', type: 'stack', label: 'detener', params: [{ type: 'text', val: 'todos' }] },
  ],
  sensing: [
    { id: 'touching', type: 'bool', label: 'tocando', params: [{ type: 'text', val: 'puntero del raton' }] },
    { id: 'touchcolor', type: 'bool', label: 'tocando el color' },
    { id: 'askwait', type: 'stack', label: 'preguntar', params: [{ type: 'text', val: 'Como te llamas?' }], suffix: 'y esperar' },
    { id: 'answer', type: 'reporter', label: 'respuesta' },
    { id: 'keypressed', type: 'bool', label: 'tecla', params: [{ type: 'text', val: 'espacio' }], suffix: 'presionada?' },
    { id: 'mousex', type: 'reporter', label: 'posicion x del raton' },
    { id: 'mousey', type: 'reporter', label: 'posicion y del raton' },
    { id: 'timer', type: 'reporter', label: 'cronometro' },
    { id: 'resettimer', type: 'stack', label: 'reiniciar cronometro' },
  ],
  operators: [
    { id: 'add', type: 'reporter', label: '+', params: [{ type: 'num', val: '' }, { type: 'num', val: '' }] },
    { id: 'subtract', type: 'reporter', label: '-', params: [{ type: 'num', val: '' }, { type: 'num', val: '' }] },
    { id: 'multiply', type: 'reporter', label: '*', params: [{ type: 'num', val: '' }, { type: 'num', val: '' }] },
    { id: 'divide', type: 'reporter', label: '/', params: [{ type: 'num', val: '' }, { type: 'num', val: '' }] },
    { id: 'random', type: 'reporter', label: 'num al azar entre', params: [{ type: 'num', val: '1' }, { type: 'num', val: '10' }] },
    { id: 'greater', type: 'bool', label: '>', params: [{ type: 'num', val: '50' }, { type: 'num', val: '' }] },
    { id: 'less', type: 'bool', label: '<', params: [{ type: 'num', val: '50' }, { type: 'num', val: '' }] },
    { id: 'equals', type: 'bool', label: '=', params: [{ type: 'num', val: '50' }, { type: 'num', val: '' }] },
    { id: 'and', type: 'bool', label: 'y' },
    { id: 'or', type: 'bool', label: 'o' },
    { id: 'not', type: 'bool', label: 'no' },
    { id: 'join', type: 'reporter', label: 'unir', params: [{ type: 'text', val: 'manzana' }, { type: 'text', val: 'banana' }] },
    { id: 'letter', type: 'reporter', label: 'letra', params: [{ type: 'num', val: '1' }], suffix: 'de', params2: [{ type: 'text', val: 'manzana' }] },
    { id: 'length', type: 'reporter', label: 'longitud de', params: [{ type: 'text', val: 'manzana' }] },
    { id: 'mod', type: 'reporter', label: 'modulo', params: [{ type: 'num', val: '' }, { type: 'num', val: '' }] },
    { id: 'round', type: 'reporter', label: 'redondear', params: [{ type: 'num', val: '' }] },
  ],
  variables: [
    { id: 'setvariable', type: 'stack', label: 'fijar', params: [{ type: 'text', val: 'mi variable' }], suffix: 'a', params2: [{ type: 'num', val: '0' }] },
    { id: 'changevariable', type: 'stack', label: 'cambiar', params: [{ type: 'text', val: 'mi variable' }], suffix: 'en', params2: [{ type: 'num', val: '1' }] },
    { id: 'showvariable', type: 'stack', label: 'mostrar variable', params: [{ type: 'text', val: 'mi variable' }] },
    { id: 'hidevariable', type: 'stack', label: 'esconder variable', params: [{ type: 'text', val: 'mi variable' }] },
  ],
  myblocks: [
    { id: 'newblock', type: 'hat', label: 'definir mi bloque' },
  ],
};

let instanceCounter = 0;
const makeId = () => 'blk-' + (++instanceCounter) + '-' + Date.now();

const BlockShape = ({ block, color, isDragging, onDragStart }) => {
  const isHat = block.type === 'hat';
  const isC = block.type === 'c';
  const isReporter = block.type === 'reporter';
  const isBool = block.type === 'bool';
  return (
    <div
      className={'scratch-block-shape' + (isHat ? ' hat-block' : '') + (isC ? ' c-block' : '') + (isReporter ? ' reporter-block' : '') + (isBool ? ' bool-block' : '') + (isDragging ? ' dragging' : '')}
      style={{ background: color, borderColor: shadeColor(color, -20) }}
      draggable
      onDragStart={onDragStart}
    >
      {isHat && <div className="hat-curve" style={{ background: color }}></div>}
      {!isReporter && !isBool && <div className="puzzle-notch-top"></div>}
      <div className="block-label-row">
        <span className="block-text">{block.label}</span>
        {(block.params||[]).map((p, i) => (
          <input key={i} className={'block-param' + (p.type === 'bool' ? ' bool-param' : '')} defaultValue={p.val} style={{ width: p.type === 'text' ? '60px' : '36px' }} onClick={e => e.stopPropagation()} />
        ))}
        {block.suffix && <span className="block-text">{block.suffix}</span>}
        {(block.params2||[]).map((p, i) => (
          <input key={'p2-'+i} className="block-param" defaultValue={p.val} style={{ width: p.type === 'text' ? '60px' : '36px' }} onClick={e => e.stopPropagation()} />
        ))}
        {block.suffix2 && <span className="block-text">{block.suffix2}</span>}
      </div>
      {isC && <div className="c-block-slot"><div className="c-block-inner-notch"></div></div>}
      {!isReporter && !isBool && <div className="puzzle-tab-bottom"></div>}
    </div>
  );
};

function shadeColor(hex, amount) {
  if (!hex || !hex.startsWith('#')) return hex;
  const num = parseInt(hex.slice(1), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + amount));
  const b = Math.min(255, Math.max(0, (num & 0xff) + amount));
  return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
}

const ScratchIDE = ({ lessonData }) => {
  const [activeCat, setActiveCat] = useState('motion');
  const [workspace, setWorkspace] = useState([]);
  const [zoom, setZoom] = useState(1);
  const [draggingBlock, setDraggingBlock] = useState(null);
  const workspaceRef = useRef(null);
  const [spriteState, setSpriteState] = useState({ x: 0, y: 0, dir: 90, costume: 1, visible: true, size: 100, saying: '' });

  const currentCat = CATEGORIES.find(c => c.id === activeCat) || CATEGORIES[0];
  const catColor = currentCat.color;
  const catBlocks = BLOCKS_BY_CATEGORY[activeCat] || [];

  const handlePaletteBlockDragStart = (e, blockDef) => {
    setDraggingBlock({ ...blockDef, instanceId: makeId() });
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleWorkspaceDrop = (e) => {
    e.preventDefault();
    if (!draggingBlock) return;
    const rect = workspaceRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;
    setWorkspace(prev => [...prev, { ...draggingBlock, x, y, instanceId: makeId() }]);
    setDraggingBlock(null);
  };

  const handleWorkspaceBlockDragStart = (e, inst) => {
    setDraggingBlock(inst);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleWorkspaceBlockDrop = (e, targetIdx) => {
    e.stopPropagation();
    // magnetic snap: add dragging block below target
    if (!draggingBlock) return;
    setWorkspace(prev => {
      const updated = prev.filter(b => b.instanceId !== draggingBlock.instanceId);
      const target = prev[targetIdx];
      return [...updated, { ...draggingBlock, x: target.x, y: target.y + 40, instanceId: draggingBlock.instanceId || makeId() }];
    });
    setDraggingBlock(null);
  };

  const removeBlock = (instId) => setWorkspace(prev => prev.filter(b => b.instanceId !== instId));

  const handleRunGreen = () => {
    const hasFlag = workspace.some(b => b.id === 'whenflag');
    if (!hasFlag) return;
    let newState = { ...spriteState, saying: '' };
    workspace.forEach(blk => {
      if (blk.id === 'move') { const steps = parseInt(blk.params?.[0]?.val || 10); newState.x += Math.round(steps * Math.cos((newState.dir - 90) * Math.PI / 180)); newState.y += Math.round(steps * Math.sin((newState.dir - 90) * Math.PI / 180)); }
      else if (blk.id === 'turn_right') { newState.dir = (newState.dir + parseInt(blk.params?.[0]?.val || 15)) % 360; }
      else if (blk.id === 'turn_left') { newState.dir = (newState.dir - parseInt(blk.params?.[0]?.val || 15) + 360) % 360; }
      else if (blk.id === 'say' || blk.id === 'sayforever') { newState.saying = blk.params?.[0]?.val || ''; }
      else if (blk.id === 'show') { newState.visible = true; }
      else if (blk.id === 'hide') { newState.visible = false; }
      else if (blk.id === 'setsize') { newState.size = parseInt(blk.params?.[0]?.val || 100); }
      else if (blk.id === 'gotoxy') { newState.x = parseInt(blk.params?.[0]?.val || 0); newState.y = parseInt(blk.params?.[1]?.val || 0); }
    });
    newState.x = Math.max(-240, Math.min(240, newState.x));
    newState.y = Math.max(-180, Math.min(180, newState.y));
    setSpriteState(newState);
  };

  const handleStop = () => setSpriteState(prev => ({ ...prev, saying: '' }));

  return (
    <div className="scratch-pro-ide">
      {/* 1. BARRA LATERAL DE CATEGORIAS */}
      <aside className="scratch-rail-nav">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            className={'cat-btn' + (activeCat === cat.id ? ' active' : '')}
            style={{ '--cat-color': cat.color }}
            onClick={() => setActiveCat(cat.id)}
          >
            <span className="cat-dot" style={{ background: cat.color }}></span>
            <span className="cat-label">{cat.label}</span>
          </button>
        ))}
      </aside>

      {/* 2. PALETA DE BLOQUES */}
      <div className="scratch-blocks-palette" style={{ '--palette-color': catColor }}>
        <div className="palette-category-header" style={{ background: catColor }}>
          {currentCat.label}
        </div>
        <div className="palette-blocks-list">
          {catBlocks.map(blk => (
            <div key={blk.id} className="palette-block-wrapper">
              <BlockShape
                block={blk}
                color={catColor}
                isDragging={false}
                onDragStart={(e) => handlePaletteBlockDragStart(e, blk)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* 3. ESPACIO DE TRABAJO */}
      <div className="scratch-workspace-area">
        <div className="workspace-toolbar">
          <button className="ws-ctrl-btn" onClick={() => setZoom(z => Math.min(2, z + 0.1))}>+</button>
          <span className="zoom-label">{Math.round(zoom * 100)}%</span>
          <button className="ws-ctrl-btn" onClick={() => setZoom(z => Math.max(0.4, z - 0.1))}>-</button>
          <button className="ws-ctrl-btn" onClick={() => setZoom(1)}>1:1</button>
          <button className="ws-ctrl-btn danger" onClick={() => setWorkspace([])}>Limpiar</button>
          <button className="ws-ctrl-btn run-btn" onClick={handleRunGreen} title="Ejecutar programa">Ejecutar</button>
          <button className="ws-ctrl-btn stop-btn" onClick={handleStop} title="Detener">Detener</button>
        </div>
        <div
          ref={workspaceRef}
          className="scratch-canvas"
          onDragOver={e => e.preventDefault()}
          onDrop={handleWorkspaceDrop}
        >
          <div className="canvas-inner" style={{ transform: 'scale(' + zoom + ')', transformOrigin: 'top left' }}>
            {workspace.map((inst, idx) => (
              <div
                key={inst.instanceId}
                className="workspace-block-wrapper"
                style={{ left: inst.x + 'px', top: inst.y + 'px' }}
                draggable
                onDragStart={(e) => handleWorkspaceBlockDragStart(e, inst)}
                onDrop={(e) => handleWorkspaceBlockDrop(e, idx)}
                onDragOver={e => e.preventDefault()}
              >
                <BlockShape
                  block={inst}
                  color={CATEGORIES.find(c => Object.keys(BLOCKS_BY_CATEGORY).includes(c.id) && BLOCKS_BY_CATEGORY[c.id].some(b => b.id === inst.id))?.color || '#4C97FF'}
                  isDragging={false}
                  onDragStart={(e) => handleWorkspaceBlockDragStart(e, inst)}
                />
                <button className="remove-block-btn" onClick={() => removeBlock(inst.instanceId)} title="Eliminar">x</button>
              </div>
            ))}
            {workspace.length === 0 && (
              <div className="workspace-empty-hint">Arrastra bloques desde la paleta para crear tu programa</div>
            )}
          </div>
        </div>
      </div>

      {/* 4. ESCENARIO DEL PERSONAJE */}
      <div className="scratch-stage-panel">
        <div className="stage-header">
          <button className="stage-flag-btn" onClick={handleRunGreen} title="Al presionar bandera verde">
            <svg viewBox="0 0 24 24" width="18" height="18"><polygon points="4,2 20,12 4,22" fill="green"/></svg>
          </button>
          <button className="stage-stop-btn" onClick={handleStop} title="Detener">
            <svg viewBox="0 0 24 24" width="18" height="18"><rect x="4" y="4" width="16" height="16" fill="red"/></svg>
          </button>
        </div>
        <div className="stage-canvas-box">
          {spriteState.visible && (
            <div
              className="sprite-entity"
              style={{
                left: (120 + spriteState.x) + 'px',
                top: (90 - spriteState.y) + 'px',
                transform: 'rotate(' + (spriteState.dir - 90) + 'deg) scale(' + (spriteState.size / 100) + ')',
              }}
            >
              <svg viewBox="0 0 50 50" width="40" height="40">
                <ellipse cx="25" cy="30" rx="20" ry="18" fill="#FFA500"/>
                <circle cx="25" cy="22" r="12" fill="#FFA500"/>
                <circle cx="21" cy="20" r="3" fill="white"/>
                <circle cx="29" cy="20" r="3" fill="white"/>
                <circle cx="21" cy="20" r="1.5" fill="black"/>
                <circle cx="29" cy="20" r="1.5" fill="black"/>
                <path d="M20 27 Q25 31 30 27" stroke="black" strokeWidth="1.5" fill="none"/>
                <path d="M15 15 L10 8 M35 15 L40 8" stroke="#FFA500" strokeWidth="2"/>
              </svg>
              {spriteState.saying && (
                <div className="sprite-speech">{spriteState.saying}</div>
              )}
            </div>
          )}
        </div>
        <div className="stage-info-bar">
          <span>X: {spriteState.x}</span>
          <span>Y: {spriteState.y}</span>
          <span>Dir: {spriteState.dir}</span>
        </div>
      </div>
    </div>
  );
};
export default ScratchIDE;