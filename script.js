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

  const minImages = 4;
  const baseSpeed = 0.7;
  const fixedSpeeds = [0.5, 1.5, 2.5, 3.5];
  const speedPool = [...fixedSpeeds]; // Vitesse disponibles
  const imageSpeeds = new Map(); // index → vitesse attribuée
  const visibleImages = new Set(); // index des images visibles

  const driftIntensity = 2;

  let screenWidth = window.innerWidth;
  let screenHeight = window.innerHeight;
  let centerX = screenWidth / 2;
  let centerY = screenHeight / 2;

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
      const availableIndexes = imageUrls
        .map((_, i) => i)
        .filter(i => !visibleImages.has(i));

      if (availableIndexes.length === 0 || speedPool.length === 0) return null;

      index = availableIndexes[Math.floor(Math.random() * availableIndexes.length)];
    }

    if (speedPool.length === 0) return null;

    const speedMultiplier = speedPool.shift(); // retirer une vitesse disponible
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
      angle,
      startX: x,
      startY: y,
      edge,
      speed: individualSpeed,
      hasChangedDirection: false,
      angleChangeTimer: 0,
      targetAngle: angle,
      transitionProgress: 1,
      isDragging: false,
      dragOffsetX: 0,
      dragOffsetY: 0,
      index
    };

    img.addEventListener('mouseenter', () => img.dataset.paused = 'true');
    img.addEventListener('mouseleave', () => {
      if (!img.floatingData.isDragging) img.dataset.paused = 'false';
    });

    img.style.cursor = 'grab';

    img.addEventListener('mousedown', (e) => {
      e.preventDefault();
      startDrag(img, e.clientX, e.clientY);
    });

    img.addEventListener('touchstart', (e) => {
      const touch = e.touches[0];
      startDrag(img, touch.clientX, touch.clientY);
    });

    function startDrag(img, clientX, clientY) {
      const data = img.floatingData;
      data.isDragging = true;
      img.dataset.paused = 'true';

      const rect = img.getBoundingClientRect();
      data.dragOffsetX = clientX - rect.left;
      data.dragOffsetY = clientY - rect.top;

      img.style.opacity = '0.7';
      img.style.transform = 'scale(1.05)';
      img.style.zIndex = '1000';
      img.style.cursor = 'grabbing';

      function onMove(e) {
        const moveX = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX;
        const moveY = e.type.startsWith('touch') ? e.touches[0].clientY : e.clientY;
        img.style.left = `${moveX - data.dragOffsetX}px`;
        img.style.top = `${moveY - data.dragOffsetY}px`;
      }

      function onEnd() {
        data.isDragging = false;
        img.dataset.paused = 'false';

        img.style.opacity = '1';
        img.style.transform = 'scale(1)';
        img.style.zIndex = 'auto';
        img.style.cursor = 'grab';

        img.dataset.mode = 'random';
        data.hasChangedDirection = true;
        data.targetAngle = Math.random() * 360;
        data.transitionProgress = 0;
        data.angleChangeTimer = 0;

        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onEnd);
        document.removeEventListener('touchmove', onMove);
        document.removeEventListener('touchend', onEnd);
      }

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
    const data = img.floatingData;
    const currentX = parseFloat(img.style.left);
    const currentY = parseFloat(img.style.top);

    const quarterWidth = screenWidth / 4;
    const quarterHeight = screenHeight / 4;

    switch (data.edge) {
      case 0: return (currentY - data.startY) > quarterHeight;
      case 1: return (data.startX - currentX) > quarterWidth;
      case 2: return (data.startY - currentY) > quarterHeight;
      case 3: return (currentX - data.startX) > quarterWidth;
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
      const data = img.floatingData;

      if (img.dataset.mode === 'towardsCenter' && !data.hasChangedDirection) {
        if (hasMovedQuarterScreen(img)) {
          img.dataset.mode = 'random';
          data.hasChangedDirection = true;
          data.targetAngle = data.angle + (Math.random() - 0.5) * 60;
          data.transitionProgress = 0;
          data.angleChangeTimer = 0;
        }
      }

      if (img.dataset.mode === 'random') {
        data.angleChangeTimer++;

        if (data.transitionProgress < 1) {
          data.transitionProgress += 0.02;
          if (data.transitionProgress > 1) data.transitionProgress = 1;
          const angleDiff = data.targetAngle - data.angle;
          data.angle += angleDiff * 0.02;
        }

        if (data.angleChangeTimer > 180 + Math.random() * 120) {
          data.targetAngle = data.angle + (Math.random() - 0.5) * 45;
          data.transitionProgress = 0;
          data.angleChangeTimer = 0;
        }

        data.angle += (Math.random() - 0.5) * driftIntensity;
      }

      const dx = Math.cos(data.angle * Math.PI / 180) * data.speed;
      const dy = Math.sin(data.angle * Math.PI / 180) * data.speed;

      x += dx;
      y += dy;

      img.style.left = `${x}px`;
      img.style.top = `${y}px`;

      if (isOutOfBounds(x, y)) {
        imagesToRemove.push(img);
      }
    });

    imagesToRemove.forEach(img => {
      const index = img.floatingData.index;

      visibleImages.delete(index);

      const oldSpeed = imageSpeeds.get(index);
      if (oldSpeed !== undefined) {
        speedPool.push(oldSpeed);
        imageSpeeds.delete(index);
      }

      container.removeChild(img);
    });

    while (document.getElementsByClassName('floating-image').length < minImages) {
      createFloatingImage();
    }

    requestAnimationFrame(updatePositions);
  }

  initFloatingImages();
  requestAnimationFrame(updatePositions);
});
