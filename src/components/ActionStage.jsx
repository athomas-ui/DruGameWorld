import { useEffect, useRef, useState } from 'react';

const WIDTH = 640;
const HEIGHT = 280;
const PLAYER_SIZE = 28;
const ENEMY_SIZE = 26;
const BULLET_SPEED = 7.5;
const ENEMY_BULLET_SPEED = 4.2;
const PLAYER_MAX_X = WIDTH * 0.55;

const CATEGORY_THEME = {
  Phishing: { color: '#f0b429', shape: 'hook', label: 'Phishing Lures' },
  Malware: { color: '#ff6b6b', shape: 'blob', label: 'Malware Blobs' },
  'Social Engineering': { color: '#c084fc', shape: 'mask', label: 'Impersonators' },
  'Password Security': { color: '#58a6ff', shape: 'lock', label: 'Brute-Force Bots' },
  Ransomware: { color: '#f85149', shape: 'skull', label: 'Ransomware Nodes' },
  'Insider Threat': { color: '#d29922', shape: 'shadow', label: 'Rogue Processes' },
  'Network Security': { color: '#39d2c0', shape: 'signal', label: 'Packet Sniffers' },
  'Data Handling': { color: '#a5d6ff', shape: 'doc', label: 'Leak Fragments' },
  'Physical Security': { color: '#ffa657', shape: 'eye', label: 'Intruders' },
  'Incident Response': { color: '#f85149', shape: 'boss', label: 'Breach Core' },
};

const DIFFICULTY_CONFIG = {
  Easy: { targetKills: 4, spawnInterval: 1300, enemySpeed: 1.1, enemyHp: 1, maxOnScreen: 3 },
  Medium: { targetKills: 6, spawnInterval: 1100, enemySpeed: 1.4, enemyHp: 1, maxOnScreen: 4 },
  Hard: { targetKills: 8, spawnInterval: 950, enemySpeed: 1.7, enemyHp: 2, maxOnScreen: 4 },
  Boss: { targetKills: 12, spawnInterval: 800, enemySpeed: 1.9, enemyHp: 3, maxOnScreen: 5 },
};

const MOVE_KEYS = new Set([
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'KeyW',
  'KeyA',
  'KeyS',
  'KeyD',
  'Space',
  'KeyX',
]);

function drawPlayer(ctx, x, y, color, walking, now) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';

  ctx.beginPath();
  ctx.arc(x, y - 14, 6, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(x, y - 8);
  ctx.lineTo(x, y + 4);
  ctx.stroke();

  // gun arm forward, off arm back
  ctx.beginPath();
  ctx.moveTo(x, y - 4);
  ctx.lineTo(x + 16, y - 4);
  ctx.moveTo(x, y - 4);
  ctx.lineTo(x - 9, y + 2);
  ctx.stroke();

  const swing = walking ? Math.sin(now / 80) * 6 : 2;
  ctx.beginPath();
  ctx.moveTo(x, y + 4);
  ctx.lineTo(x - 6 + swing, y + 15);
  ctx.moveTo(x, y + 4);
  ctx.lineTo(x + 6 - swing, y + 15);
  ctx.stroke();
}

function drawEnemy(ctx, enemy, theme) {
  const { x, y } = enemy;
  ctx.fillStyle = theme.color;
  ctx.strokeStyle = theme.color;
  ctx.lineWidth = 2;
  const r = ENEMY_SIZE / 2;

  switch (theme.shape) {
    case 'hook':
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x - r, y - r);
      ctx.lineTo(x - r, y + r);
      ctx.closePath();
      ctx.fill();
      break;
    case 'blob':
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x - r * 0.4, y - r * 0.3, 2, 0, Math.PI * 2);
      ctx.arc(x + r * 0.3, y - r * 0.2, 2, 0, Math.PI * 2);
      ctx.fillStyle = '#0d1117';
      ctx.fill();
      break;
    case 'mask':
      ctx.beginPath();
      ctx.moveTo(x, y - r);
      ctx.lineTo(x + r, y);
      ctx.lineTo(x, y + r);
      ctx.lineTo(x - r, y);
      ctx.closePath();
      ctx.fill();
      break;
    case 'lock':
      ctx.strokeRect(x - r * 0.6, y - r * 0.2, r * 1.2, r);
      ctx.beginPath();
      ctx.arc(x, y - r * 0.2, r * 0.5, Math.PI, 0);
      ctx.stroke();
      break;
    case 'skull':
    case 'boss':
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0d1117';
      ctx.beginPath();
      ctx.arc(x - r * 0.35, y - r * 0.1, 3, 0, Math.PI * 2);
      ctx.arc(x + r * 0.35, y - r * 0.1, 3, 0, Math.PI * 2);
      ctx.fill();
      if (enemy.hp > 1) {
        ctx.fillStyle = '#f85149';
        ctx.fillRect(x - r, y - r - 10, (r * 2 * enemy.hp) / enemy.maxHp, 3);
      }
      break;
    case 'shadow':
      ctx.globalAlpha = 0.55;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      break;
    case 'signal':
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x - r, y - r * 0.6);
      ctx.lineTo(x - r * 0.5, y);
      ctx.lineTo(x - r, y + r * 0.6);
      ctx.closePath();
      ctx.fill();
      break;
    case 'doc':
      ctx.fillRect(x - r * 0.6, y - r, r * 1.2, r * 2);
      ctx.strokeStyle = '#0d1117';
      ctx.beginPath();
      ctx.moveTo(x - r * 0.3, y - r * 0.4);
      ctx.lineTo(x + r * 0.3, y - r * 0.4);
      ctx.moveTo(x - r * 0.3, y);
      ctx.lineTo(x + r * 0.3, y);
      ctx.moveTo(x - r * 0.3, y + r * 0.4);
      ctx.lineTo(x + r * 0.3, y + r * 0.4);
      ctx.stroke();
      break;
    case 'eye':
      ctx.beginPath();
      ctx.ellipse(x, y, r, r * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0d1117';
      ctx.beginPath();
      ctx.arc(x, y, r * 0.3, 0, Math.PI * 2);
      ctx.fill();
      break;
    default:
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
  }
}

export default function ActionStage({ mission, characterColor, onClear, onRetry, onExit }) {
  const canvasRef = useRef(null);
  const [hud, setHud] = useState({ health: 3, kills: 0, target: 0, status: 'playing' });

  useEffect(() => {
    const theme = CATEGORY_THEME[mission.category] || CATEGORY_THEME.Phishing;
    const config = DIFFICULTY_CONFIG[mission.difficulty] || DIFFICULTY_CONFIG.Easy;

    const state = {
      player: { x: 60, y: HEIGHT / 2 },
      bullets: [],
      enemies: [],
      enemyBullets: [],
      keys: {},
      health: 3,
      kills: 0,
      target: config.targetKills,
      lastSpawn: 0,
      lastShot: 0,
      status: 'playing',
    };

    setHud({ health: 3, kills: 0, target: config.targetKills, status: 'playing' });

    function handleKeyDown(e) {
      if (MOVE_KEYS.has(e.code)) e.preventDefault();
      state.keys[e.code] = true;
    }
    function handleKeyUp(e) {
      if (MOVE_KEYS.has(e.code)) e.preventDefault();
      state.keys[e.code] = false;
    }
    function handleClick() {
      state.keys['Space'] = true;
      window.setTimeout(() => {
        state.keys['Space'] = false;
      }, 40);
    }

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    const canvas = canvasRef.current;
    canvas.addEventListener('mousedown', handleClick);

    const ctx = canvas.getContext('2d');
    let raf;
    let lastTime = performance.now();

    function spawnEnemy(now) {
      const y = 30 + Math.random() * (HEIGHT - 60);
      state.enemies.push({
        x: WIDTH - 20,
        y,
        baseY: y,
        hp: config.enemyHp,
        maxHp: config.enemyHp,
        lastShot: now,
        seed: Math.random() * 1000,
      });
    }

    function update(dt, now) {
      if (state.status !== 'playing') return;
      const speed = 0.17 * dt;
      if (state.keys['ArrowUp'] || state.keys['KeyW']) state.player.y -= speed;
      if (state.keys['ArrowDown'] || state.keys['KeyS']) state.player.y += speed;
      if (state.keys['ArrowLeft'] || state.keys['KeyA']) state.player.x -= speed;
      if (state.keys['ArrowRight'] || state.keys['KeyD']) state.player.x += speed;
      state.player.x = Math.max(16, Math.min(PLAYER_MAX_X, state.player.x));
      state.player.y = Math.max(16, Math.min(HEIGHT - 16, state.player.y));
      state.walking = !!(
        state.keys['ArrowUp'] ||
        state.keys['ArrowDown'] ||
        state.keys['ArrowLeft'] ||
        state.keys['ArrowRight'] ||
        state.keys['KeyW'] ||
        state.keys['KeyA'] ||
        state.keys['KeyS'] ||
        state.keys['KeyD']
      );

      if ((state.keys['Space'] || state.keys['KeyX']) && now - state.lastShot > 260) {
        state.bullets.push({ x: state.player.x + PLAYER_SIZE / 2, y: state.player.y - 4 });
        state.lastShot = now;
      }

      if (now - state.lastSpawn > config.spawnInterval && state.enemies.length < config.maxOnScreen) {
        spawnEnemy(now);
        state.lastSpawn = now;
      }

      state.bullets.forEach((b) => (b.x += BULLET_SPEED * (dt / 16)));
      state.bullets = state.bullets.filter((b) => b.x < WIDTH && !b.hit);

      state.enemies.forEach((en) => {
        en.x -= config.enemySpeed * (dt / 16);
        en.y = en.baseY + Math.sin((now + en.seed * 50) / 450) * 20;
        if (now - en.lastShot > 1700 && Math.random() < 0.015 * (dt / 16)) {
          state.enemyBullets.push({ x: en.x - ENEMY_SIZE / 2, y: en.y });
          en.lastShot = now;
        }
      });
      state.enemies = state.enemies.filter((en) => en.x > -20);

      state.enemyBullets.forEach((b) => (b.x -= ENEMY_BULLET_SPEED * (dt / 16)));
      state.enemyBullets = state.enemyBullets.filter((b) => b.x > -10 && !b.hit);

      state.bullets.forEach((b) => {
        state.enemies.forEach((en) => {
          if (!en.dead && Math.hypot(b.x - en.x, b.y - en.y) < ENEMY_SIZE / 2 + 4) {
            en.hp -= 1;
            b.hit = true;
            if (en.hp <= 0) en.dead = true;
          }
        });
      });
      const killed = state.enemies.filter((en) => en.dead).length;
      if (killed > 0) {
        state.kills += killed;
        state.enemies = state.enemies.filter((en) => !en.dead);
      }

      let hitPlayer = false;
      state.enemies.forEach((en) => {
        if (Math.hypot(en.x - state.player.x, en.y - state.player.y) < ENEMY_SIZE / 2 + PLAYER_SIZE / 2 - 8) {
          en.dead = true;
          hitPlayer = true;
        }
      });
      state.enemyBullets.forEach((b) => {
        if (Math.hypot(b.x - state.player.x, b.y - state.player.y) < PLAYER_SIZE / 2) {
          b.hit = true;
          hitPlayer = true;
        }
      });
      if (hitPlayer) {
        state.enemies = state.enemies.filter((en) => !en.dead);
        state.enemyBullets = state.enemyBullets.filter((b) => !b.hit);
        state.health -= 1;
        if (state.health <= 0) state.status = 'defeated';
      }

      if (state.kills >= state.target && state.status === 'playing') {
        state.status = 'cleared';
      }

      setHud({ health: state.health, kills: state.kills, target: state.target, status: state.status });
    }

    function draw(now) {
      ctx.fillStyle = '#0d1117';
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
      ctx.strokeStyle = '#161b22';
      ctx.lineWidth = 1;
      for (let gx = 0; gx < WIDTH; gx += 40) {
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, HEIGHT);
        ctx.stroke();
      }

      drawPlayer(ctx, state.player.x, state.player.y, characterColor, state.walking, now);

      ctx.fillStyle = characterColor;
      state.bullets.forEach((b) => {
        ctx.beginPath();
        ctx.arc(b.x, b.y, 4, 0, Math.PI * 2);
        ctx.fill();
      });

      state.enemies.forEach((en) => drawEnemy(ctx, en, theme));

      ctx.fillStyle = '#f85149';
      state.enemyBullets.forEach((b) => {
        ctx.beginPath();
        ctx.arc(b.x, b.y, 4, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    function loop(now) {
      const dt = Math.min(now - lastTime, 50);
      lastTime = now;
      update(dt, now);
      draw(now);
      if (state.status === 'playing') {
        raf = requestAnimationFrame(loop);
      }
    }

    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      canvas.removeEventListener('mousedown', handleClick);
    };
  }, [mission, characterColor]);

  const theme = CATEGORY_THEME[mission.category] || CATEGORY_THEME.Phishing;

  return (
    <div className="action-stage">
      <div className="action-hud">
        <span>{'❤'.repeat(hud.health)}{'♡'.repeat(Math.max(0, 3 - hud.health))}</span>
        <span>
          {theme.label}: {hud.kills}/{hud.target}
        </span>
      </div>
      <div className="action-canvas-wrap">
        <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} className="action-canvas" />
        {hud.status === 'defeated' && (
          <div className="action-overlay">
            <p>You were overwhelmed.</p>
            <button type="button" className="primary-button" onClick={onRetry}>
              Try Again
            </button>
            <button type="button" className="ghost-button" onClick={onExit}>
              Abort Mission
            </button>
          </div>
        )}
        {hud.status === 'cleared' && (
          <div className="action-overlay">
            <p>Threat neutralized!</p>
            <button type="button" className="primary-button" onClick={onClear}>
              Continue to Debrief
            </button>
          </div>
        )}
      </div>
      <p className="action-hint">Move: Arrow Keys / WASD &nbsp;·&nbsp; Shoot: Space / Click</p>
    </div>
  );
}
