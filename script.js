document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById('image-container');
  const imageUrls = [
    'asset/img/20231005_154014.png',
    'asset/img/affiches_2e_2.png',
    'asset/img/DSC_0004.png',
    'asset/img/Insta_Post-Feed.png',
    'asset/img/my_artwork-45.png',
    'asset/img/my_artwork-71.png',
    'asset/img/Posterwall.png',
  ];

  const isMobile = /Mobi|Android/i.test(navigator.userAgent);
  const minImages = isMobile ? 3 : 4;
  const baseSpeed = 0.7;
  const fixedSpeeds = [1.5, 2.25, 3, 3.75];
  const speedPool = [...fixedSpeeds];
  const imageSpeeds = new Map();
  const visibleImages = new Set();

  const driftIntensity = 2;

  let screenWidth = window.innerWidth;
  let screenHeight = window.innerHeight;
  let centerX = screenWidth / 2;
  let centerY = screenHeight / 2;
  let animationFrameId = null;
  let isAnimationPaused = false;
  let lastTimestamp = 0;

  let usedEdges = [];
  let edgePositions = { 0: [], 1: [], 2: [], 3: [] };

  window.addEventListener('resize', () => {
    screenWidth = window.innerWidth;
    screenHeight = window.innerHeight;
    centerX = screenWidth / 2;
    centerY = screenHeight / 2;
  });

  function getRandomEdgePosition() {
    let edge, x, y;
    let attempts = 0;

    do {
      edge = Math.floor(Math.random() * 4);
      attempts++;
    } while (usedEdges.filter(e => e === edge).length >= 2 && attempts < 20);

    if (usedEdges.length >= 4) {
      usedEdges = [];
      edgePositions = { 0: [], 1: [], 2: [], 3: [] };
    }

    usedEdges.push(edge);
    const margin = 150;

    switch (edge) {
      case 0:
        do { x = Math.random() * screenWidth; }
        while (edgePositions[0].some(pos => Math.abs(pos - x) < margin));
        y = -100;
        edgePositions[0].push(x);
        break;
      case 1:
        x = screenWidth + 100;
        do { y = Math.random() * screenHeight; }
        while (edgePositions[1].some(pos => Math.abs(pos - y) < margin));
        edgePositions[1].push(y);
        break;
      case 2:
        do { x = Math.random() * screenWidth; }
        while (edgePositions[2].some(pos => Math.abs(pos - x) < margin));
        y = screenHeight + 100;
        edgePositions[2].push(x);
        break;
      case 3:
        x = -100;
        do { y = Math.random() * screenHeight; }
        while (edgePositions[3].some(pos => Math.abs(pos - y) < margin));
        edgePositions[3].push(y);
        break;
    }

    const angleToCenter = Math.atan2(centerY - y, centerX - x) * 180 / Math.PI;
    const angle = angleToCenter + (Math.random() * 20 - 10);

    return { x, y, angle, edge };
  }

  function initFloatingImages() {
    while (document.getElementsByClassName('floating-image').length < minImages) {
      createFloatingImage();
    }
  }

  function createFloatingImage(forcedIndex = null) {
    let index;

    if (forcedIndex !== null) {
      index = forcedIndex;
    } else {
      const availableIndexes = imageUrls.map((_, i) => i).filter(i => !visibleImages.has(i));
      if (availableIndexes.length === 0 || speedPool.length === 0) return null;
      index = availableIndexes[Math.floor(Math.random() * availableIndexes.length)];
    }

    if (speedPool.length === 0) return null;

    const speedMultiplier = speedPool.shift();
    imageSpeeds.set(index, speedMultiplier);
    visibleImages.add(index);

    const img = document.createElement('img');
    img.src = imageUrls[index];
    img.classList.add('floating-image');
    img.dataset.paused = 'false';
    img.dataset.mode = 'towardsCenter';

    const { x, y, angle, edge } = getRandomEdgePosition();
    img.style.left = `${x}px`;
    img.style.top = `${y}px`;

    const individualSpeed = baseSpeed * speedMultiplier;

    img.floatingData = {
      angle, startX: x, startY: y, edge,
      speed: individualSpeed, hasChangedDirection: false,
      angleChangeTimer: 0, targetAngle: angle,
      transitionProgress: 1, isDragging: false,
      index
    };

    img.addEventListener('mouseenter', () => img.dataset.paused = 'true');
    img.addEventListener('mouseleave', () => {
      if (!img.floatingData.isDragging) img.dataset.paused = 'false';
    });

    // Nouveau système de drag & drop
    img.style.cursor = 'grab';
    
    let newX = 0, newY = 0, startX = 0, startY = 0;
    let isDragging = false;
    
    img.addEventListener('mousedown', mouseDown);
    img.addEventListener('touchstart', e => {
      const t = e.touches[0];
      mouseDown({ clientX: t.clientX, clientY: t.clientY });
    });

    function mouseDown(e) {
      e.preventDefault();
      isDragging = true;
      const d = img.floatingData;
      d.isDragging = true;
      img.dataset.paused = 'true';
      
      startX = e.clientX;
      startY = e.clientY;
      
      img.style.cursor = 'grabbing';
      img.style.zIndex = '1000';
      
      document.addEventListener('mousemove', mouseMove);
      document.addEventListener('mouseup', mouseUp);
    }

    function mouseMove(e) {
      if (!isDragging) return;
      e.preventDefault();
      
      newX = startX - e.clientX;
      newY = startY - e.clientY;
      
      startX = e.clientX;
      startY = e.clientY;
      
      img.style.left = (img.offsetLeft - newX) + 'px';
      img.style.top = (img.offsetTop - newY) + 'px';
    }

    function mouseUp(e) {
      if (!isDragging) return;
      
      isDragging = false;
      const d = img.floatingData;
      d.isDragging = false;
      img.dataset.paused = 'false';
      img.style.cursor = 'grab';
      img.style.zIndex = 'auto';
      img.dataset.mode = 'random';
      d.hasChangedDirection = true;
      d.targetAngle = Math.random() * 360;
      d.transitionProgress = 0;
      d.angleChangeTimer = 0;
      
      document.removeEventListener('mousemove', mouseMove);
      document.removeEventListener('mouseup', mouseUp);
    }

    container.appendChild(img);
    return img;
  }

  function isOutOfBounds(x, y) {
    return x < -150 || x > screenWidth + 150 || y < -150 || y > screenHeight + 150;
  }

  function hasMovedQuarterScreen(img) {
    const d = img.floatingData;
    const x = parseFloat(img.style.left);
    const y = parseFloat(img.style.top);
    const qW = screenWidth / 4;
    const qH = screenHeight / 4;
    switch (d.edge) {
      case 0: return (y - d.startY) > qH;
      case 1: return (d.startX - x) > qW;
      case 2: return (d.startY - y) > qH;
      case 3: return (x - d.startX) > qW;
    }
    return false;
  }

  function updatePositions(timestamp) {
    // Optimisation : réduction à 30fps pour économiser les ressources
    if (timestamp - lastTimestamp < 33) { // 33ms = ~30fps
      animationFrameId = requestAnimationFrame(updatePositions);
      return;
    }
    lastTimestamp = timestamp;

    if (isAnimationPaused) {
      animationFrameId = requestAnimationFrame(updatePositions);
      return;
    }

    const images = Array.from(document.getElementsByClassName('floating-image'));
    const imagesToRemove = [];

    images.forEach(img => {
      if (img.dataset.paused === 'true' || img.floatingData.isDragging) return;

      let x = parseFloat(img.style.left);
      let y = parseFloat(img.style.top);
      const d = img.floatingData;

      // Optimisation : calcul de trajectoire moins fréquent
      if (img.dataset.mode === 'towardsCenter' && !d.hasChangedDirection && hasMovedQuarterScreen(img)) {
        img.dataset.mode = 'random';
        d.hasChangedDirection = true;
        d.targetAngle = d.angle + (Math.random() - 0.5) * 60;
        d.transitionProgress = 0;
        d.angleChangeTimer = 0;
      }

      if (img.dataset.mode === 'random') {
        d.angleChangeTimer++;
        
        // Optimisation : transition d'angle plus rapide (moins de calculs)
        if (d.transitionProgress < 1) {
          d.transitionProgress += 0.05; // Accéléré de 0.02 à 0.05
          if (d.transitionProgress > 1) d.transitionProgress = 1;
          d.angle += (d.targetAngle - d.angle) * 0.05; // Accéléré de 0.02 à 0.05
        }
        
        // Optimisation : changement d'angle moins fréquent
        if (d.angleChangeTimer > 300 + Math.random() * 180) { // Augmenté de 180+120 à 300+180
          d.targetAngle = d.angle + (Math.random() - 0.5) * 45;
          d.transitionProgress = 0;
          d.angleChangeTimer = 0;
        }
        
        // Optimisation : drift réduit et moins fréquent
        if (d.angleChangeTimer % 3 === 0) { // Drift appliqué seulement 1 fois sur 3
          d.angle += (Math.random() - 0.5) * (driftIntensity * 0.5); // Intensité réduite de moitié
        }
      }

      // Optimisation : calcul trigonométrique en cache
      const radians = d.angle * Math.PI / 180;
      const dx = Math.cos(radians) * d.speed;
      const dy = Math.sin(radians) * d.speed;
      
      x += dx;
      y += dy;
      
      // Optimisation : mise à jour DOM moins fréquente pour les petits mouvements
      const deltaX = Math.abs(dx);
      const deltaY = Math.abs(dy);
      if (deltaX > 0.5 || deltaY > 0.5) { // Seuil de mise à jour
        img.style.left = `${x}px`;
        img.style.top = `${y}px`;
      }

      if (isOutOfBounds(x, y)) imagesToRemove.push(img);
    });

    // Optimisation : traitement par batch des suppressions
    if (imagesToRemove.length > 0) {
      imagesToRemove.forEach(img => {
        const idx = img.floatingData.index;
        visibleImages.delete(idx);
        const oldSpeed = imageSpeeds.get(idx);
        if (oldSpeed !== undefined) {
          speedPool.push(oldSpeed);
          imageSpeeds.delete(idx);
        }
        if (img.parentNode) container.removeChild(img);
      });
    }

    // Optimisation : création d'images moins fréquente
    const currentImageCount = document.getElementsByClassName('floating-image').length;
    if (currentImageCount < minImages) {
      // Créer une seule image à la fois
      createFloatingImage();
    }

    animationFrameId = requestAnimationFrame(updatePositions);
  }

  // Gestion optimisée de la visibilité de l'onglet
  function handleVisibilityChange() {
    if (document.visibilityState === 'hidden') {
      isAnimationPaused = true;
      // Optionnel : pause complète de l'animation
      // if (animationFrameId) {
      //   cancelAnimationFrame(animationFrameId);
      //   animationFrameId = null;
      // }
    } else if (document.visibilityState === 'visible') {
      isAnimationPaused = false;
      lastTimestamp = performance.now(); // Reset du timestamp
      if (!animationFrameId) {
        animationFrameId = requestAnimationFrame(updatePositions);
      }
    }
  }

  // Gestion du focus/blur de la fenêtre comme backup
  function handleWindowFocus() {
    isAnimationPaused = false;
    lastTimestamp = performance.now();
    if (!animationFrameId) {
      animationFrameId = requestAnimationFrame(updatePositions);
    }
  }

  function handleWindowBlur() {
    isAnimationPaused = true;
  }

  initFloatingImages();
  animationFrameId = requestAnimationFrame(updatePositions);

  // Event listeners pour la gestion de la visibilité
  document.addEventListener('visibilitychange', handleVisibilityChange);
  window.addEventListener('focus', handleWindowFocus);
  window.addEventListener('blur', handleWindowBlur);

  // Cleanup au déchargement de la page
  window.addEventListener('beforeunload', () => {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    window.removeEventListener('focus', handleWindowFocus);
    window.removeEventListener('blur', handleWindowBlur);
  });
});