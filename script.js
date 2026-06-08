const cfg = window.LOVE_CONFIG || LOVE_CONFIG;

const gameScreen = document.getElementById('gameScreen');
const treasureScreen = document.getElementById('treasureScreen');
const letterScreen = document.getElementById('letterScreen');
const gameArea = document.getElementById('gameArea');
const heartCountEl = document.getElementById('heartCount');
const heartTotalEl = document.getElementById('heartTotal');
const progressFill = document.getElementById('progressFill');
const heartChest = document.getElementById('heartChest');
const letterText = document.getElementById('letterText');
const skipBtn = document.getElementById('skipBtn');
const gallery = document.getElementById('gallery');
const galleryBlock = document.getElementById('galleryBlock');
const bgMusic = document.getElementById('bgMusic');
const soundBtn = document.getElementById('soundBtn');
const modal = document.getElementById('photoModal');
const modalImage = document.getElementById('modalImage');
const modalCaption = document.getElementById('modalCaption');
const modalClose = document.getElementById('modalClose');

let collected = 0;
let typingTimer = null;
let typingIndex = 0;
let typingDone = false;

const heartPositions = [
  { left: 12, top: 24 },
  { left: 72, top: 18 },
  { left: 45, top: 42 },
  { left: 20, top: 68 },
  { left: 78, top: 67 },
  { left: 58, top: 77 },
  { left: 35, top: 14 },
  { left: 8, top: 50 }
];

function initText() {
  document.getElementById('gameTitle').textContent = cfg.gameTitle;
  document.getElementById('gameSubtitle').textContent = cfg.gameSubtitle;
  document.getElementById('treasureTitle').textContent = cfg.treasureTitle;
  document.getElementById('treasureSubtitle').textContent = cfg.treasureSubtitle;
  document.getElementById('letterTo').textContent = cfg.letterTo;
  document.getElementById('letterTitle').textContent = cfg.letterTitle;
  document.getElementById('signature').textContent = cfg.signature;
  heartTotalEl.textContent = cfg.totalHearts;
}

function createFloatingHearts() {
  const layer = document.getElementById('floatingLayer');
  const icons = ['♡', '♥', '✦', '✧'];
  for (let i = 0; i < 34; i++) {
    const item = document.createElement('span');
    item.className = 'float-heart';
    item.textContent = icons[Math.floor(Math.random() * icons.length)];
    item.style.left = Math.random() * 100 + 'vw';
    item.style.animationDuration = (8 + Math.random() * 10) + 's';
    item.style.animationDelay = (-Math.random() * 12) + 's';
    item.style.color = cfg.pastelPalette[i % cfg.pastelPalette.length];
    item.style.fontSize = (13 + Math.random() * 20) + 'px';
    layer.appendChild(item);
  }
}

function spawnHearts() {
  const total = Number(cfg.totalHearts || 5);
  for (let i = 0; i < total; i++) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'collect-heart';
    btn.setAttribute('aria-label', `Hati ke-${i + 1}`);
    const pos = heartPositions[i % heartPositions.length];
    btn.style.left = `calc(${pos.left}% - 36px)`;
    btn.style.top = `calc(${pos.top}% - 36px)`;
    btn.style.animationDelay = `${i * .18}s`;
    btn.addEventListener('click', (event) => collectHeart(btn, event));
    gameArea.appendChild(btn);
  }
}

function collectHeart(btn, event) {
  if (btn.classList.contains('collected')) return;
  btn.classList.add('collected');
  collected++;
  updateProgress();
  popEffect(event.clientX, event.clientY);
  if (collected >= Number(cfg.totalHearts || 5)) {
    setTimeout(showTreasure, 780);
  }
}

function updateProgress() {
  heartCountEl.textContent = collected;
  progressFill.style.width = `${(collected / Number(cfg.totalHearts || 5)) * 100}%`;
}

function popEffect(x, y) {
  for (let i = 0; i < 7; i++) {
    const pop = document.createElement('span');
    pop.className = 'pop';
    pop.textContent = i % 2 ? '♡' : '♥';
    pop.style.left = `${x + (Math.random() * 50 - 25)}px`;
    pop.style.top = `${y + (Math.random() * 30 - 15)}px`;
    pop.style.color = cfg.pastelPalette[i % cfg.pastelPalette.length];
    document.body.appendChild(pop);
    setTimeout(() => pop.remove(), 850);
  }
}

function showTreasure() {
  gameScreen.classList.add('hidden');
  treasureScreen.classList.remove('hidden');
}

heartChest.addEventListener('click', () => {
  heartChest.classList.add('opened');
  setTimeout(() => {
    treasureScreen.classList.add('hidden');
    letterScreen.classList.remove('hidden');
    startTyping();
    renderGallery();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, 950);
});

function startTyping() {
  const message = cfg.letterMessage || '';
  typingIndex = 0;
  typingDone = false;
  letterText.textContent = '';
  skipBtn.classList.remove('hidden');

  function type() {
    letterText.textContent = message.slice(0, typingIndex++);
    if (typingIndex <= message.length) {
      typingTimer = setTimeout(type, Number(cfg.typingSpeed || 35));
    } else {
      finishTyping();
    }
  }
  type();
}

function finishTyping() {
  typingDone = true;
  clearTimeout(typingTimer);
  letterText.textContent = cfg.letterMessage || '';
  skipBtn.classList.add('hidden');
  setTimeout(() => galleryBlock.classList.add('show'), 350);
}

skipBtn.addEventListener('click', finishTyping);

function renderGallery() {
  gallery.innerHTML = '';
  (cfg.photos || []).forEach((photo, index) => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'photo-card';
    card.style.setProperty('--rotate', `${index % 2 === 0 ? -2 : 2}deg`);
    card.innerHTML = `<img src="${photo.src}" alt="${photo.caption || 'Foto kenangan'}"><p>${photo.caption || 'Kenangan indah'}</p>`;
    card.addEventListener('click', () => openPhoto(photo));
    gallery.appendChild(card);
  });
}

function openPhoto(photo) {
  modalImage.src = photo.src;
  modalCaption.textContent = photo.caption || 'Kenangan indah';
  modal.classList.remove('hidden');
}
modalClose.addEventListener('click', () => modal.classList.add('hidden'));
modal.addEventListener('click', (e) => {
  if (e.target === modal) modal.classList.add('hidden');
});

function initMusic() {
  if (!cfg.music) {
    soundBtn.textContent = '♪ Musik kosong';
    soundBtn.classList.add('muted');
    return;
  }
  bgMusic.src = cfg.music;
  soundBtn.addEventListener('click', async () => {
    if (bgMusic.paused) {
      await bgMusic.play().catch(() => {});
      soundBtn.textContent = '♫ Musik ON';
      soundBtn.classList.remove('muted');
    } else {
      bgMusic.pause();
      soundBtn.textContent = '♪ Musik OFF';
      soundBtn.classList.add('muted');
    }
  });
}

initText();
createFloatingHearts();
spawnHearts();
initMusic();
