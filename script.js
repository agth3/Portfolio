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
  const fixedSpeeds = [0.9, 1.0, 1.1, 1.2]; // 4 vitesses fixes
  let speedIndex = 0; // Index pour répartir les vitesses
  const driftIntensity = 2;
  
  // Cache des dimensions
  let screenWidth = window.innerWidth;
  let screenHeight = window.innerHeight;
  let centerX = screenWidth / 2;
  let centerY = screenHeight / 2;
  
  // Gestion des positions d'apparition
  let usedEdges = [];
  let edgePositions = { 0: [], 1: [], 2: [], 3: [] };
  
  // Mise à jour des dimensions lors du redimensionnement
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
    
    // Réinitialiser si tous les bords sont utilisés
    if (usedEdges.length >= 4) {
      usedEdges = [];
      edgePositions = { 0: [], 1: [], 2: [], 3: [] };
    }
    
    usedEdges.push(edge);
    
    const margin = 150;
    
    switch (edge) {
      case 0: // haut
        do {
          x = Math.random() * screenWidth;
        } while (edgePositions[0].some(pos => Math.abs(pos - x) < margin));
        y = -100;
        edgePositions[0].push(x);
        break;
        
      case 1: // droite
        x = screenWidth + 100;
        do {
          y = Math.random() * screenHeight;
        } while (edgePositions[1].some(pos => Math.abs(pos - y) < margin));
        edgePositions[1].push(y);
        break;
        
      case 2: // bas
        do {
          x = Math.random() * screenWidth;
        } while (edgePositions[2].some(pos => Math.abs(pos - x) < margin));
        y = screenHeight + 100;
        edgePositions[2].push(x);
        break;
        
      case 3: // gauche
        x = -100;
        do {
          y = Math.random() * screenHeight;
        } while (edgePositions[3].some(pos => Math.abs(pos - y) < margin));
        edgePositions[3].push(y);
        break;
    }

    // Direction vers le centre avec variation
    const angleToCenter = Math.atan2(centerY - y, centerX - x) * 180 / Math.PI;
    const angle = angleToCenter + (Math.random() * 20 - 10);

    return { x, y, angle, edge };
  }

  let lastIndexes = [];

  function initFloatingImages() {
    const usedIndexes = new Set();

    while (usedIndexes.size < minImages && usedIndexes.size < imageUrls.length) {
      let index;
      do {
        index = Math.floor(Math.random() * imageUrls.length);
      } while (usedIndexes.has(index));
      usedIndexes.add(index);

      createFloatingImage(index);
    }
  }

  function createFloatingImage(forcedIndex = null) {
    let index;
    if (forcedIndex !== null) {
      index = forcedIndex;
    } else {
      do {
        index = Math.floor(Math.random() * imageUrls.length);
      } while (lastIndexes.includes(index) && imageUrls.length > minImages);
      lastIndexes.push(index);
      if (lastIndexes.length > minImages) lastIndexes.shift();
    }

    const img = document.createElement('img');
    img.src = imageUrls[index];
    img.classList.add('floating-image');
    img.dataset.paused = 'false';
    img.dataset.mode = 'towardsCenter';

    const { x, y, angle, edge } = getRandomEdgePosition();
    img.style.left = `${x}px`;
    img.style.top = `${y}px`;
    
    // Attribution des vitesses fixes en rotation
    const speedMultiplier = fixedSpeeds[speedIndex];
    speedIndex = (speedIndex + 1) % fixedSpeeds.length;
    const individualSpeed = baseSpeed * speedMultiplier;
    
    // Stockage des données propres à chaque image
    img.floatingData = {
      angle: angle,
      startX: x,
      startY: y,
      edge: edge,
      speed: individualSpeed,
      hasChangedDirection: false,
      angleChangeTimer: 0,
      targetAngle: angle,
      transitionProgress: 1, // 1 = transition terminée
      isDragging: false,
      dragOffsetX: 0,
      dragOffsetY: 0
    };

    // Pause on hover
    img.addEventListener('mouseenter', () => img.dataset.paused = 'true');
    img.addEventListener('mouseleave', () => img.dataset.paused = 'false');

    // Drag & Drop functionality
    img.draggable = true;
    img.style.cursor = 'move';

    img.addEventListener('dragstart', (e) => {
      const data = img.floatingData;
      data.isDragging = true;
      img.dataset.paused = 'true';
      
      // Calculer l'offset entre la souris et le coin de l'image
      const rect = img.getBoundingClientRect();
      data.dragOffsetX = e.clientX - rect.left;
      data.dragOffsetY = e.clientY - rect.top;
      
      // Style pendant le drag
      img.style.opacity = '0.7';
      img.style.transform = 'scale(1.1)';
      img.style.zIndex = '1000';
    });

    img.addEventListener('dragend', (e) => {
      const data = img.floatingData;
      data.isDragging = false;
      img.dataset.paused = 'false';
      
      // Calculer la nouvelle position
      const newX = e.clientX - data.dragOffsetX;
      const newY = e.clientY - data.dragOffsetY;
      
      img.style.left = `${newX}px`;
      img.style.top = `${newY}px`;
      
      // Remettre le style normal
      img.style.opacity = '1';
      img.style.transform = 'scale(1)';
      img.style.zIndex = 'auto';
      
      // Changer le mode en aléatoire après un drag
      img.dataset.mode = 'random';
      data.hasChangedDirection = true;
      data.targetAngle = Math.random() * 360;
      data.transitionProgress = 0;
      data.angleChangeTimer = 0;
    });

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
      case 0: // haut
        return (currentY - data.startY) > quarterHeight;
      case 1: // droite
        return (data.startX - currentX) > quarterWidth;
      case 2: // bas
        return (data.startY - currentY) > quarterHeight;
      case 3: // gauche
        return (currentX - data.startX) > quarterWidth;
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

      // Vérification si l'image a parcouru 1/4 d'écran
      if (img.dataset.mode === 'towardsCenter' && !data.hasChangedDirection) {
        if (hasMovedQuarterScreen(img)) {
          img.dataset.mode = 'random';
          data.hasChangedDirection = true;
          // Démarrer une transition fluide vers un nouvel angle
          data.targetAngle = data.angle + (Math.random() - 0.5) * 60;
          data.transitionProgress = 0;
          data.angleChangeTimer = 0;
        }
      }

      // Mode déplacement aléatoire avec transitions fluides
      if (img.dataset.mode === 'random') {
        data.angleChangeTimer++;
        
        // Transition fluide vers l'angle cible
        if (data.transitionProgress < 1) {
          data.transitionProgress += 0.02; // Vitesse de transition
          if (data.transitionProgress > 1) data.transitionProgress = 1;
          
          const angleDiff = data.targetAngle - data.angle;
          data.angle += angleDiff * 0.02;
        }
        
        // Changement d'angle périodique moins fréquent (plus fluide)
        if (data.angleChangeTimer > 180 + Math.random() * 120) { // 3-5 secondes à 60fps
          data.targetAngle = data.angle + (Math.random() - 0.5) * 45;
          data.transitionProgress = 0;
          data.angleChangeTimer = 0;
        }
        
        // Dérive légère continue
        data.angle += (Math.random() - 0.5) * driftIntensity;
      }

      // Calcul du déplacement
      const dx = Math.cos(data.angle * Math.PI / 180) * data.speed;
      const dy = Math.sin(data.angle * Math.PI / 180) * data.speed;

      x += dx;
      y += dy;

      img.style.left = `${x}px`;
      img.style.top = `${y}px`;

      // Vérification si l'image est sortie de l'écran
      if (isOutOfBounds(x, y)) {
        imagesToRemove.push(img);
      }
    });

    // Suppression des images hors écran
    imagesToRemove.forEach(img => {
      container.removeChild(img);
    });

    // Création de nouvelles images si nécessaire
    while (document.getElementsByClassName('floating-image').length < minImages) {
      createFloatingImage();
    }

    requestAnimationFrame(updatePositions);
  }

  // Permettre le drop sur le container
  container.addEventListener('dragover', (e) => {
    e.preventDefault();
  });

  container.addEventListener('drop', (e) => {
    e.preventDefault();
  });

  initFloatingImages();
  requestAnimationFrame(updatePositions);
});