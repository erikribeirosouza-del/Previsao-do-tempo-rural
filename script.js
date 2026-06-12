// ── DATA DINÂMICA ──
const d = new Date();
const ds = d.toLocaleDateString('pt-BR',{weekday:'long',year:'numeric',month:'long',day:'numeric'});
document.getElementById('dateDisplay').textContent = ds.charAt(0).toUpperCase()+ds.slice(1);

// ══════════════════════════════════════════════════
//   CAMPO DE PLANTIO ANIMADO EM CANVAS
// ══════════════════════════════════════════════════
const canvas = document.getElementById('farmCanvas');
const ctx = canvas.getContext('2d');

let W, H, scrollY = 0;

function resize() {
  W = canvas.width  = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);
window.addEventListener('scroll', () => { scrollY = window.scrollY; });

// ── CÉU: gradiente amanhecer/dia agrícola ──
function drawSky(t) {
  const grad = ctx.createLinearGradient(0, 0, 0, H * 0.68);
  grad.addColorStop(0,    '#0D2B5E');
  grad.addColorStop(0.25, '#1A5BA8');
  grad.addColorStop(0.55, '#2E86D4');
  grad.addColorStop(0.82, '#72B8E8');
  grad.addColorStop(1,    '#B8DCF0');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H * 0.68);
}

// ── NUVENS ──
const clouds = Array.from({length: 5}, (_, i) => ({
  x: Math.random() * W * 1.5,
  y: H * (0.08 + Math.random() * 0.22),
  w: 160 + Math.random() * 200,
  speed: 0.12 + Math.random() * 0.18,
  opacity: 0.55 + Math.random() * 0.3,
}));

function drawCloud(cx, cy, cw, opacity) {
  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.fillStyle = '#e8f4ff';
  const h = cw * 0.28;
  // corpo principal
  ctx.beginPath();
  ctx.ellipse(cx, cy + h * 0.5, cw * 0.42, h * 0.5, 0, 0, Math.PI*2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx - cw * 0.22, cy + h * 0.65, cw * 0.28, h * 0.38, 0, 0, Math.PI*2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx + cw * 0.22, cy + h * 0.65, cw * 0.3, h * 0.4, 0, 0, Math.PI*2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx - cw * 0.08, cy + h * 0.2, cw * 0.32, h * 0.48, 0, 0, Math.PI*2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx + cw * 0.12, cy + h * 0.15, cw * 0.28, h * 0.44, 0, 0, Math.PI*2);
  ctx.fill();
  ctx.restore();
}

// ── MONTANHAS AO FUNDO ──
function drawMountains() {
  const baseY = H * 0.62;
  // montanha traseira (azulada)
  ctx.fillStyle = '#2a5e8a';
  ctx.beginPath();
  ctx.moveTo(0, baseY + 10);
  ctx.lineTo(W * 0.12, baseY - H * 0.14);
  ctx.lineTo(W * 0.28, baseY - H * 0.06);
  ctx.lineTo(W * 0.44, baseY - H * 0.18);
  ctx.lineTo(W * 0.58, baseY - H * 0.08);
  ctx.lineTo(W * 0.72, baseY - H * 0.16);
  ctx.lineTo(W * 0.88, baseY - H * 0.07);
  ctx.lineTo(W, baseY - H * 0.12);
  ctx.lineTo(W, baseY + 10);
  ctx.closePath();
  ctx.fill();
  // montanha frontal (mais escura / verde-azul)
  ctx.fillStyle = '#1e4a2e';
  ctx.beginPath();
  ctx.moveTo(0, baseY + 5);
  ctx.lineTo(W * 0.08, baseY - H * 0.07);
  ctx.lineTo(W * 0.18, baseY - H * 0.02);
  ctx.lineTo(W * 0.35, baseY - H * 0.11);
  ctx.lineTo(W * 0.5,  baseY - H * 0.04);
  ctx.lineTo(W * 0.65, baseY - H * 0.09);
  ctx.lineTo(W * 0.78, baseY - H * 0.03);
  ctx.lineTo(W * 0.92, baseY - H * 0.1);
  ctx.lineTo(W, baseY - H * 0.05);
  ctx.lineTo(W, baseY + 5);
  ctx.closePath();
  ctx.fill();
}

// ── SOLO (CAMADAS) ──
function drawSoil() {
  const gy = H * 0.62;
  // terra vermelha-marrom
  const soilGrad = ctx.createLinearGradient(0, gy, 0, H);
  soilGrad.addColorStop(0,   '#3d1f0a');
  soilGrad.addColorStop(0.3, '#5c2e10');
  soilGrad.addColorStop(1,   '#2a1206');
  ctx.fillStyle = soilGrad;
  ctx.fillRect(0, gy, W, H - gy);
}

// ── FILEIRAS DE PLANTIO (sulcos) ──
function drawFurrows() {
  const baseY = H * 0.64;
  const rows = 14;
  for (let i = 0; i < rows; i++) {
    const y = baseY + i * ((H - baseY) / rows);
    const perspective = 0.3 + i * 0.055;
    const grd = ctx.createLinearGradient(0, y, W, y);
    grd.addColorStop(0,   'rgba(120,60,10,0.0)');
    grd.addColorStop(0.5, `rgba(20,8,0,${0.3 * perspective})`);
    grd.addColorStop(1,   'rgba(120,60,10,0.0)');
    ctx.strokeStyle = grd;
    ctx.lineWidth = Math.max(1, perspective * 3.5);
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }
}

// ── PLANTAS DE TRIGO ──
const PLANT_ROWS = 10;

function makePlants() {
  const plants = [];
  const baseY = H * 0.64;
  for (let r = 0; r < PLANT_ROWS; r++) {
    const rowFrac = r / (PLANT_ROWS - 1);
    const y = baseY + rowFrac * (H - baseY) * 0.85 + 8;
    const scale = 0.38 + rowFrac * 0.62;
    const cols = Math.floor(W / (28 + rowFrac * 20)) + 4;
    for (let c = 0; c < cols; c++) {
      plants.push({
        x: c * (W / cols) + Math.random() * 10 - 5,
        y,
        scale,
        swayOff: Math.random() * Math.PI * 2,
        rowFrac,
      });
    }
  }
  return plants;
}

let plants = makePlants();
window.addEventListener('resize', () => { resize(); plants = makePlants(); });

function drawPlant(px, py, scale, sway) {
  ctx.save();
  ctx.translate(px, py);

  const h = 38 * scale;
  const lean = sway * 4 * scale;

  // Caule
  ctx.strokeStyle = `rgba(${Math.round(80+scale*60)},${Math.round(100+scale*55)},20,0.92)`;
  ctx.lineWidth = Math.max(0.8, scale * 1.6);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(lean * 0.5, -h * 0.5, lean, -h);
  ctx.stroke();

  // Folhas laterais pequenas
  if (scale > 0.45) {
    ctx.strokeStyle = `rgba(60,120,15,0.7)`;
    ctx.lineWidth = Math.max(0.5, scale * 1.1);
    ctx.beginPath();
    ctx.moveTo(lean * 0.3, -h * 0.35);
    ctx.quadraticCurveTo(lean * 0.3 - 9 * scale, -h * 0.48, lean * 0.3 - 14 * scale, -h * 0.42);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(lean * 0.55, -h * 0.6);
    ctx.quadraticCurveTo(lean * 0.55 + 8 * scale, -h * 0.72, lean * 0.55 + 13 * scale, -h * 0.68);
    ctx.stroke();
  }

  // Espiga no topo
  const ew = 3.5 * scale;
  const eh = 11 * scale;
  const ex = lean;
  const ey = -h;

  // Espiga dourada
  const spikeGrad = ctx.createLinearGradient(ex, ey, ex, ey - eh);
  spikeGrad.addColorStop(0,   `rgba(180,120,10,0.95)`);
  spikeGrad.addColorStop(0.5, `rgba(220,170,30,0.95)`);
  spikeGrad.addColorStop(1,   `rgba(240,200,60,0.8