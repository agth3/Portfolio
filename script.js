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
      dragOffsetX: 0, dragOffsetY: 0, index
    };

    img.addEventListener('mouseenter', () => img.dataset.paused = 'true');
    img.addEventListener('mouseleave', () => {
      if (!img.floatingData.isDragging) img.dataset.paused = 'false';
    });

    img.style.cursor = 'grab';
    img.addEventListener('mousedown', e => startDrag(img, e.clientX, e.clientY));
    img.addEventListener('touchstart', e => {
      const t = e.touches[0];
      startDrag(img, t.clientX, t.clientY);
    });

    function startDrag(img, clientX, clientY) {
      const d = img.floatingData;
      d.isDragging = true;
      img.dataset.paused = 'true';

      const rect = img.getBoundingClientRect();
      d.dragOffsetX = clientX - rect.left;
      d.dragOffsetY = clientY - rect.top;

      img.style.opacity = '0.7';
      img.style.transform = 'scale(1.05)';
      img.style.zIndex = '1000';
      img.style.cursor = 'grabbing';

      const onMove = e => {
        const moveX = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX;
        const moveY = e.type.startsWith('touch') ? e.touches[0].clientY : e.clientY;
        img.style.left = `${moveX - d.dragOffsetX}px`;
        img.style.top = `${moveY - d.dragOffsetY}px`;
      };

      const onEnd = () => {
        d.isDragging = false;
        img.dataset.paused = 'false';
        img.style.opacity = '1';
        img.style.transform = 'scale(1)';
        img.style.zIndex = 'auto';
        img.style.cursor = 'grab';
        img.dataset.mode = 'random';
        d.hasChangedDirection = true;
        d.targetAngle = Math.random() * 360;
        d.transitionProgress = 0;
        d.angleChangeTimer = 0;
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onEnd);
        document.removeEventListener('touchmove', onMove);
        document.removeEventListener('touchend', onEnd);
      };

      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onEnd);
      document.addEventListener('touchmove', onMove);
      document.addEventListener('touchend', onEnd);
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

  function updatePositions() {
    const images = Array.from(document.getElementsByClassName('floating-image'));
    const imagesToRemove = [];

    images.forEach(img => {
      if (img.dataset.paused === 'true' || img.floatingData.isDragging) return;

      let x = parseFloat(img.style.left);
      let y = parseFloat(img.style.top);
      const d = img.floatingData;

      if (img.dataset.mode === 'towardsCenter' && !d.hasChangedDirection && hasMovedQuarterScreen(img)) {
        img.dataset.mode = 'random';
        d.hasChangedDirection = true;
        d.targetAngle = d.angle + (Math.random() - 0.5) * 60;
        d.transitionProgress = 0;
        d.angleChangeTimer = 0;
      }

      if (img.dataset.mode === 'random') {
        d.angleChangeTimer++;
        if (d.transitionProgress < 1) {
          d.transitionProgress += 0.02;
          if (d.transitionProgress > 1) d.transitionProgress = 1;
          d.angle += (d.targetAngle - d.angle) * 0.02;
        }
        if (d.angleChangeTimer > 180 + Math.random() * 120) {
          d.targetAngle = d.angle + (Math.random() - 0.5) * 45;
          d.transitionProgress = 0;
          d.angleChangeTimer = 0;
        }
        d.angle += (Math.random() - 0.5) * driftIntensity;
      }

      const dx = Math.cos(d.angle * Math.PI / 180) * d.speed;
      const dy = Math.sin(d.angle * Math.PI / 180) * d.speed;
      x += dx;
      y += dy;
      img.style.left = `${x}px`;
      img.style.top = `${y}px`;

      if (isOutOfBounds(x, y)) imagesToRemove.push(img);
    });

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

    while (document.getElementsByClassName('floating-image').length < minImages) {
      createFloatingImage();
    }

    animationFrameId = requestAnimationFrame(updatePositions);
  }

  initFloatingImages();
  animationFrameId = requestAnimationFrame(updatePositions);

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
    } else if (document.visibilityState === 'visible' && !animationFrameId) {
      animationFrameId = requestAnimationFrame(updatePositions);
    }
  });
});
