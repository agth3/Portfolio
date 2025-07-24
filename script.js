document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById('image-container');
  
  // Configuration des images avec lazy-loading
  const imageConfig = [
    {
      lowRes: 'asset/img/low/20231005_154014.png',
      highRes: 'asset/img/high/20231005_154014.jpg',
      link: 'projets.html',
      titleMobile:'Img Mob 1',
      titleDesktop:'Img Ord 1'
    },
    {
      lowRes: 'asset/img/low/affiches_2e_2.png',
      highRes: 'asset/img/high/affiches_2e_2.jpg',
      link: 'projets.html',
      titleMobile:'Img Mob 2',
      titleDesktop:'Img Ord 2'
    },
    {
      lowRes: 'asset/img/low/DSC_0004.png',
      highRes: 'asset/img/high/DSC_0004.JPG',
      link: 'projets.html',
      titleMobile:'Img Mob 3',
      titleDesktop:'Img Ord 3'
    },
    {
      lowRes: 'asset/img/low/Insta_Post-Feed.png',
      highRes: 'asset/img/high/Insta_Post-Feed.png',
      link: 'projets.html',
      titleMobile:'Img Mob 4',
      titleDesktop:'Img Ord 4'
    },
    {
      lowRes: 'asset/img/low/my_artwork-45.png',
      highRes: 'asset/img/high/my_artwork-45.png',
      link: 'projets.html',
      titleMobile:'Img Mob 5',
      titleDesktop:'Img Ord 5'
    },
    {
      lowRes: 'asset/img/low/my_artwork-71.png',
      highRes: 'asset/img/high/my_artwork-71.png',
      link: 'projets.html',
      titleMobile:'Img Mob 6',
      titleDesktop:'Img Ord 1'
    },
    {
      lowRes: 'asset/img/low/Posterwall.png',
      highRes: 'asset/img/high/Posterwall.jpg',
      link: 'projets.html',
      titleMobile:'Img Mob 7',
      titleDesktop:'Img Ord 7'
    }
  ];

  const isMobile = /Mobi|Android/i.test(navigator.userAgent);
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  // Détecter si on est en mode développeur mobile sur desktop
  const isDevToolsMobile = window.innerWidth <= 768 && !(/Mobi|Android/i.test(navigator.userAgent));
  const isTouch = isMobile || hasTouch || isDevToolsMobile;

  // Force touch mode si dev tools mobile détecté
  const shouldUseTouchMode = isTouch;

  // Debug pour voir quel mode est activé
  console.log('Detection mode:', { 
    isMobile, 
    hasTouch, 
    isDevToolsMobile, 
    isTouch,
    shouldUseTouchMode,
    userAgent: navigator.userAgent,
    windowWidth: window.innerWidth
  });

  imageConfig.forEach(item => {
      item.title = shouldUseTouchMode
        ? item.titleMobile || 'Toucher' //toucher pour Message fallback
        : item.titleDesktop || 'Double-Cliquer'; //cliquer pour Message fallback
    });

  const minImages = isMobile ? 3 : 4;
  const baseSpeed = isMobile ? 0.5 : 0.7; // Plus lent sur mobile
  const fixedSpeeds = isMobile ? 
  [1.5, 2.25, 3, 3.75] :      // Vitesses mobile
  [2.25, 3, 3.75, 4.5];       // Vitesses desktop

  const speedPool = [...fixedSpeeds];
  const imageSpeeds = new Map();
  const visibleImages = new Set();
  const preloadedImages = new Map(); // Cache des images HD préchargées

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

  // Fonction de préchargement lazy des images HD
  function preloadHighResImage(index) {
    if (preloadedImages.has(index)) return Promise.resolve(preloadedImages.get(index));
    
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        preloadedImages.set(index, img.src);
        resolve(img.src);
      };
      img.onerror = reject;
      img.src = imageConfig[index].highRes;
    });
  }

  function cleanupImage(img) {
    if (img.floatingData.clickTimer) {
      clearTimeout(img.floatingData.clickTimer);
    }
    if (img.floatingData.lowResTimer) {
      clearTimeout(img.floatingData.lowResTimer);
    }
    if (img.floatingData.focusTimer) {
      clearTimeout(img.floatingData.focusTimer);
    }
    
    // Nettoyage du titre amélioré
    hideImageTitle(img);
    
    // Suppression référence cache
    preloadedImages.delete(img.floatingData.index);
    
    // Reset référence titre
    if (img.titleElement) {
      img.titleElement = null;
    }
  }

function cleanupImageCache() {
  const maxCacheSize = 10;
  if (preloadedImages.size > maxCacheSize) {
    const entries = Array.from(preloadedImages.entries());
    const toDelete = entries.slice(0, entries.length - maxCacheSize);
    toDelete.forEach(([key]) => preloadedImages.delete(key));
  }
}

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

  function resetImageState(img) {
    console.log('Resetting image state - restarting animation');
    const d = img.floatingData;
    if (!d) return;
    
    console.log('Before reset - state:', d.state, 'tapCount:', d.tapCount); // DEBUG
    
    d.state = 'normal';

    const defaultZ = 10 + d.index * 2;
    img.style.zIndex = defaultZ;
    d.zImage = defaultZ;

    img.dataset.paused = 'false';
    
    // Retour à low-res
    if (d.isHighRes) {
      setTimeout(() => {
        if (d.state === 'normal') {
          img.src = d.originalSrc;
          d.isHighRes = false;
        }
      }, 200);
    }
    
    // Nettoyer le timer de focus
    if (d.focusTimer) {
      clearTimeout(d.focusTimer);
      d.focusTimer = null;
    }
    
    // IMPORTANT : Nettoyer le titre à chaque défocus
    hideImageTitle(img);

    // Reset du tap count pour le mode tactile
    if (shouldUseTouchMode) {
      d.tapCount = 0;
    }
    console.log('After reset - state:', d.state, 'tapCount:', d.tapCount); // DEBUG
  }

      function showImageTitle(img, title) {
      let titleEl = img.titleElement;
      if (!titleEl) {
        titleEl = document.createElement('div');
        titleEl.classList.add('floating-image-title');
        // titleEl.style.cssText = `
        //   position: absolute;
        //   background: rgba(0,0,0,0.85);
        //   color: white;
        //   padding: 6px 10px;
        //   border-radius: 4px;
        //   font-size: 13px;
        //   font-weight: 500;
        //   pointer-events: none;
        //   z-index: 1001;
        //   white-space: nowrap;
        //   transform: translate(-50%, -50%);
        //   transition: opacity 0.15s ease-out;
        //   opacity: 0;
        // `;
        container.appendChild(titleEl);
        img.titleElement = titleEl;
        const zImage = img.floatingData?.zImage || parseInt(img.style.zIndex) || 10;
        titleEl.style.zIndex = zImage + 1;
      }
      
      titleEl.textContent = title;

      // CORRECTION : affichage immédiat, calcul de position en parallèle
      titleEl.style.opacity = '1';
      updateTitlePosition(img, titleEl);
    }

      function hideImageTitle(img) {
        if (img.titleElement) {
          img.titleElement.style.opacity = '0';
          setTimeout(() => {
            if (img.titleElement && img.titleElement.parentNode) {
              container.removeChild(img.titleElement);
              img.titleElement = null;
            }
          }, 150);
        }
      }

      // Nouvelle fonction pour mise à jour position titre
      function updateTitlePosition(img, titleEl) {
        const imgLeft = parseFloat(img.style.left) || 0;
        const imgTop = parseFloat(img.style.top) || 0;
        
        // Utiliser les dimensions actuelles ou par défaut
        const imgWidth = img.offsetWidth || img.naturalWidth || 150;
        const imgHeight = img.offsetHeight || img.naturalHeight || 150;
        
        titleEl.style.left = (imgLeft + imgWidth / 2) + 'px';
        titleEl.style.top = (imgTop + imgHeight / 2) + 'px';
      }

      // Fonction pour appliquer l'état focused de manière cohérente
      function applyFocusedState(img, index) {
        const d = img.floatingData;
        console.log('Applying focused state with synchronized HD + title');
        
        d.state = 'focused';
        img.dataset.paused = 'true';
        
        // Switch vers HD et titre en même temps - CORRECTION du bug
        preloadHighResImage(index).then(highResSrc => {
          if (d.state === 'focused') { // Vérifier que l'état est toujours focused
            img.style.zIndex = 100;
            d.zImage = 100; // pour showImageTitle
            
            img.src = highResSrc;
            d.isHighRes = true;
            
            // const title = imageConfig[index].title || `Image ${index + 1}`;
            const title = shouldUseTouchMode
              ? imageConfig[index].titleMobile || imageConfig[index].title || `Image ${index + 1}`
              : imageConfig[index].titleDesktop || imageConfig[index].title || `Image ${index + 1}`;
            showImageTitle(img, title);
          }
        }).catch(console.error);
      }

      // Fonction pour les interactions tactiles (à placer AVANT createFloatingImage aussi)
      function handleTouchInteraction(img, index, e) {
        console.log('=== handleTouchInteraction CALLED ===');
        console.log('Touch interaction triggered, current state:', img.floatingData.state, 'tapCount:', img.floatingData.tapCount);
        
        if (e && e.preventDefault) e.preventDefault();
        const d = img.floatingData;
        
        // CORRECTION : Premier tap sur image normale OU image focused sans tapCount
        if (d.state === 'normal' || (d.state === 'focused' && d.tapCount === 0)) {
          console.log('FIRST TAP: Switching to focused state');
          d.tapCount = 1;
          
          // Appliquer l'état focused seulement si pas déjà focused
          if (d.state === 'normal') {
            applyFocusedState(img, index);
            
            // Défocuser toutes les autres images
            const allImages = document.getElementsByClassName('floating-image');
            Array.from(allImages).forEach(otherImg => {
              if (otherImg !== img && otherImg.floatingData.state === 'focused') {
                console.log('Unfocusing other image due to first tap');
                resetImageState(otherImg);
              }
            });
          }
          
        // Deuxième tap : navigation
        } else if (d.state === 'focused' && d.tapCount === 1) {
          console.log('SECOND TAP: Navigating to:', imageConfig[index].link);
          window.location.href = imageConfig[index].link;
          d.tapCount = 0; // Reset
        } else {
          console.log('TAP IGNORED - state:', d.state, 'tapCount:', d.tapCount);
        }
      }

  function createFloatingImage(forcedIndex = null) {
    let index;

    if (forcedIndex !== null) {
      index = forcedIndex;
    } else {
      const availableIndexes = imageConfig.map((_, i) => i).filter(i => !visibleImages.has(i));
      if (availableIndexes.length === 0 || speedPool.length === 0) return null;
      index = availableIndexes[Math.floor(Math.random() * availableIndexes.length)];
    }

    if (speedPool.length === 0) return null;

    const speedMultiplier = speedPool.shift();
    imageSpeeds.set(index, speedMultiplier);
    visibleImages.add(index);

    const img = document.createElement('img');
    img.src = imageConfig[index].lowRes; // Chargement initial avec image basse résolution
    img.classList.add('floating-image');
    img.dataset.paused = 'false';
    img.dataset.mode = 'towardsCenter';
    img.loading = 'lazy'; // Lazy loading natif

    const { x, y, angle, edge } = getRandomEdgePosition();
    img.style.left = `${x}px`;
    img.style.top = `${y}px`;

    const individualSpeed = baseSpeed * speedMultiplier;

    img.floatingData = {
      angle, startX: x, startY: y, edge,
      speed: individualSpeed, hasChangedDirection: false,
      angleChangeTimer: 0, targetAngle: angle,
      transitionProgress: 1, isDragging: false,
      index, originalSrc: imageConfig[index].lowRes,
      isHighRes: false, clickCount: 0, clickTimer: null,
      lowResTimer: null, wasDragged: false,
      // Propriétés tactiles conditionnelles
      ...(shouldUseTouchMode && {
        state: 'normal',
        focusTimer: null,
        tapCount: 0  // NOUVEAU FLAG
      })
    };


    // Préchargement immédiat de l'image HD pour switch instantané
    setTimeout(() => preloadHighResImage(index), 100);

    // Gestion du hover pour switch vers HD avec délai anti-flickering
      // État de l'image pour le mode tactile
      if (isTouch) {
        img.floatingData.state = 'normal'; // normal, focused
        img.floatingData.focusTimer = null;
      }

      // Interactions pour appareils tactiles
      if (shouldUseTouchMode) {
        // console.log('Using TOUCH MODE for image', index);
        let touchStartTime = 0;
        let touchStartPos = { x: 0, y: 0 };
        let hasMoved = false;
        
        img.addEventListener('touchstart', e => {
          touchStartTime = Date.now();
          hasMoved = false;
          if (e.touches && e.touches[0]) {
            touchStartPos.x = e.touches[0].clientX;
            touchStartPos.y = e.touches[0].clientY;
          }
        });
        
        img.addEventListener('touchmove', e => {
          if (e.touches && e.touches[0]) {
            const moveDistance = Math.abs(e.touches[0].clientX - touchStartPos.x) + 
                                Math.abs(e.touches[0].clientY - touchStartPos.y);
            if (moveDistance > 10) { // Si mouvement > 10px
              hasMoved = true;
            }
          }
        });
        
        img.addEventListener('touchend', e => {
          console.log('=== TOUCHEND EVENT ===');
          const touchDuration = Date.now() - touchStartTime;
          const d = img.floatingData;
          
          // Si c'était un drag (mouvement détecté OU wasDragged), on ignore pour la navigation
          if (hasMoved || d.wasDragged) {
            console.log('Drag detected, not triggering navigation');
            d.wasDragged = false;
            return;
          }
          
          // Si c'était un tap rapide sans mouvement, traiter comme interaction
          if (touchDuration < 300 && !hasMoved) {
            console.log('Calling handleTouchInteraction from touchend');
            handleTouchInteraction(img, index, e);
          }
          
          d.wasDragged = false;
        });
        
        // Clic souris pour le développement mobile sur desktop SEULEMENT si vraiment mobile
          if (isDevToolsMobile && !isMobile) {
            img.addEventListener('click', e => {
              if (!img.floatingData.isDragging && !img.floatingData.wasDragged) {
                handleTouchInteraction(img, index, e);
              }
            });
          }
        } else {
        
          // Interactions classiques pour desktop
          console.log('Using DESKTOP MODE for image', index);

          img.addEventListener('mouseenter', () => {
            console.log('Desktop mouseenter triggered'); // Debug
            img.dataset.paused = 'true';
            img.style.zIndex = 100;
            img.floatingData.zImage = 100;

            // Nettoyer les timers existants
            if (img.floatingData.lowResTimer) {
              clearTimeout(img.floatingData.lowResTimer);
              img.floatingData.lowResTimer = null;
            }

            // CORRECTION : Titre immédiat sans condition
            // const title = imageConfig[index].title || `Image ${index + 1}`;
            const title = shouldUseTouchMode
              ? imageConfig[index].titleMobile || imageConfig[index].title || `Image ${index + 1}`
              : imageConfig[index].titleDesktop || imageConfig[index].title || `Image ${index + 1}`;

            showImageTitle(img, title);

            // Switch HD immédiat
            if (!img.floatingData.isHighRes) {
              if (preloadedImages.has(index)) {
                img.src = preloadedImages.get(index);
                img.floatingData.isHighRes = true;
              } else {
                preloadHighResImage(index).then(highResSrc => {
                  // CORRECTION : Supprimer toutes les conditions ici
                  img.src = highResSrc;
                  img.floatingData.isHighRes = true;
                }).catch(console.error);
              }
            }
          });

          img.addEventListener('mouseleave', () => {
            console.log('Desktop mouseleave triggered'); // Debug
            if (!img.floatingData.isDragging) {
              img.dataset.paused = 'false';
              const zDefault = 10 + img.floatingData.index * 2;
              img.style.zIndex = zDefault;
              img.floatingData.zImage = zDefault;
              hideImageTitle(img);
              
              if (img.floatingData.isHighRes) {
                img.floatingData.lowResTimer = setTimeout(() => {
                  // CORRECTION : Garder seulement cette condition
                  if (!img.matches(':hover')) {
                    img.src = img.floatingData.originalSrc;
                    img.floatingData.isHighRes = false;
                  }
                  img.floatingData.lowResTimer = null;
                }, 100);
              }
            }
          });

        // Gestion du clic simple pour desktop (arrêt) et double-clic (navigation)
         img.addEventListener('click', (e) => {
          console.log('=== DESKTOP CLICK HANDLER CALLED ===');
          console.log('DESKTOP CLICK detected - isDragging:', img.floatingData.isDragging, 'wasDragged:', img.floatingData.wasDragged);
          // alert('DESKTOP click handler triggered - Mode should be: ' + (shouldUseTouchMode ? 'TOUCH' : 'DESKTOP'));

          if (img.floatingData.isDragging || img.floatingData.wasDragged) return;
          
          img.floatingData.clickCount++;
          
          if (img.floatingData.clickCount === 1) {
            // Premier clic : arrêter l'image si elle bouge
            if (img.dataset.paused === 'false') {
              img.dataset.paused = 'true';
            }
            
            img.floatingData.clickTimer = setTimeout(() => {
              img.floatingData.clickCount = 0;
              // Reprendre le mouvement après timeout si pas de second clic
              if (img.dataset.paused === 'true') {
                img.dataset.paused = 'false';
              }
            }, 400);
          } else if (img.floatingData.clickCount === 2) {
            clearTimeout(img.floatingData.clickTimer);
            img.floatingData.clickCount = 0;
            // alert('DESKTOP: Should navigate to ' + imageConfig[index].link);
            window.location.href = imageConfig[index].link; // Désactivé pour debug
          }
        });
      }

      

    // Système de drag & drop unifié
      img.style.cursor = 'grab';

      let newX = 0, newY = 0, startX = 0, startY = 0;
      let isDragging = false;
      let dragStartTime = 0;

      // Events communs
      img.addEventListener('mousedown', mouseDown);

      // Events tactiles seulement si tactile
      if (isTouch) {
        img.addEventListener('touchstart', e => {
          e.preventDefault();
          const t = e.touches[0];
          mouseDown({ 
            clientX: t.clientX, 
            clientY: t.clientY,
            preventDefault: () => {} // Ajouter une fonction preventDefault factice
          });
        }, { passive: false });
      }

      function mouseDown(e) {
        if (e.preventDefault) e.preventDefault();
        isDragging = true;
        dragStartTime = Date.now();
        const d = img.floatingData;
        d.isDragging = true;
        img.dataset.paused = 'true';
        
        // EN MODE TACTILE : appliquer immédiatement l'état focused ET défocuser les autres
        if (shouldUseTouchMode && d.state === 'normal') {
          console.log('Touch drag started - applying focused state immediately');
          d.dragStarted = true;
          
          // Appliquer l'état focused immédiatement (HD + titre + pause)
          applyFocusedState(img, index);
          
          // Défocuser toutes les AUTRES images dès le début du drag
          const allImages = document.getElementsByClassName('floating-image');
          Array.from(allImages).forEach(otherImg => {
            if (otherImg !== img && otherImg.floatingData.state === 'focused') {
              console.log('Unfocusing other image due to drag start');
              resetImageState(otherImg);
            }
          });
        }
        
        startX = e.clientX;
        startY = e.clientY;
        
        img.style.cursor = 'grabbing';
        const zImage = img.floatingData?.zImage || parseInt(img.style.zIndex) || 10;
        img.style.zIndex = zImage;
        
        document.addEventListener('mousemove', mouseMove);
        document.addEventListener('mouseup', mouseUp);
        
        if (isTouch) {
          const touchMoveHandler = (touchEvent) => {
            if (touchEvent.touches && touchEvent.touches[0]) {
              touchEvent.preventDefault();
              mouseMove({ 
                clientX: touchEvent.touches[0].clientX, 
                clientY: touchEvent.touches[0].clientY,
                preventDefault: () => {}
              });
            }
          };
          
          document.addEventListener('touchmove', touchMoveHandler, { passive: false });
          document.addEventListener('touchend', (touchEvent) => {
            document.removeEventListener('touchmove', touchMoveHandler);
            mouseUp(touchEvent);
          });
        }
      }

      function mouseMove(e) {
        if (!isDragging) return;
        if (e.preventDefault) e.preventDefault();
        
        newX = startX - e.clientX;
        newY = startY - e.clientY;
        
        startX = e.clientX;
        startY = e.clientY;
        
        img.style.left = (img.offsetLeft - newX) + 'px';
        img.style.top = (img.offsetTop - newY) + 'px';
        
        // Mise à jour position titre pendant drag
        if (img.titleElement && img.titleElement.style.opacity === '1') {
          updateTitlePosition(img, img.titleElement);
        }
      }

      function mouseUp(e) {
        if (!isDragging) return;
        
        const dragDuration = Date.now() - dragStartTime;
        const d = img.floatingData;
        
        // Considérer comme drag si durée > 150ms
        const wasDragOperation = dragDuration > 150;
        
        isDragging = false;
        d.isDragging = false;
        d.wasDragged = wasDragOperation;

        // Reset du flag wasDragged après un court délai
        setTimeout(() => {
          d.wasDragged = false;
        }, 50);
        
        img.style.cursor = 'grab';
        const z = img.floatingData?.zImage || parseInt(img.style.zIndex) || 10;
        img.style.zIndex = z;
        img.dataset.mode = 'random';
        d.hasChangedDirection = true;
        d.targetAngle = Math.random() * 360;
        d.transitionProgress = 0;
        d.angleChangeTimer = 0;
        
        // Gestion différente selon le mode
        if (!shouldUseTouchMode) {
          // MODE DESKTOP : reprendre l'animation
          img.dataset.paused = 'false';
        } else {
          // MODE TACTILE : gérer selon le type d'opération
          console.log('Touch mode mouseUp - wasDragOperation:', wasDragOperation, 'dragStarted:', d.dragStarted);
          
          if (wasDragOperation && d.dragStarted) {
            // Vrai drag : l'image reste focused
            console.log('Real drag completed - staying focused');
            // L'image est déjà focused par mouseDown, pas de changement
          } else if (d.dragStarted && !wasDragOperation) {
            // Tap court qui a déclenché mouseDown : ne pas incrémenter tapCount ici
            // car ce sera géré par handleTouchInteraction
            console.log('Short tap detected - letting touchend handle it');
          }
          
          // Reset du flag
          d.dragStarted = false;
        }
        
        document.removeEventListener('mousemove', mouseMove);
        document.removeEventListener('mouseup', mouseUp);
      }

    // console.log('Floating image created', index);
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
    if (timestamp - lastTimestamp < 33) { // 33ms = ~30fps  16ms = ~60fps
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
      if (img.dataset.paused === 'true' || img.floatingData.isDragging) {
        // console.log('Image paused - skipping animation for image', img.floatingData.index, 'paused:', img.dataset.paused);
        return;
      }

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
      // Mise à jour titre si visible
        if (img.titleElement && img.titleElement.style.opacity === '1') {
          updateTitlePosition(img, img.titleElement);
        }
      }

      if (isOutOfBounds(x, y)) imagesToRemove.push(img);
    });

    // Optimisation : traitement par batch des suppressions
if (imagesToRemove.length > 0) {
  imagesToRemove.forEach(img => {
    const idx = img.floatingData.index;
    
    cleanupImage(img); // Cette fonction doit être appelée
    
    visibleImages.delete(idx);
    const oldSpeed = imageSpeeds.get(idx);
    if (oldSpeed !== undefined) {
      speedPool.push(oldSpeed);
      imageSpeeds.delete(idx);
    }
    if (img.parentNode) {
      container.removeChild(img);
    }
  });

  // S'assurer que cleanupImageCache() soit appelée periodiquement
  if (performance.now() % 10000 < 33) { // Environ toutes les 10 secondes
    cleanupImageCache();
  }
}



    // Optimisation : création d'images moins fréquente
    const currentImageCount = document.getElementsByClassName('floating-image').length;
    if (currentImageCount < minImages) {
      // Créer une seule image à la fois
      createFloatingImage();
    }


    // if (++cleanupCounter % 300 === 0) { //cleanup n'est pas défini ce qui pose problème
    // cleanupImageCache();
// }
    // console.log('update frame');
    animationFrameId = requestAnimationFrame(updatePositions);
  }

  // Gestion optimisée de la visibilité de l'onglet
  function handleVisibilityChange() {
    if (document.visibilityState === 'hidden') {
      isAnimationPaused = true;
      // Optionnel : pause complète de l'animation
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
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

    //Désactive le focus si on tape à côté
    if (shouldUseTouchMode) {
    document.addEventListener('click', (e) => {
      const target = e.target;
      const isImage = target.classList.contains('floating-image');

      if (!isImage) {
        const images = document.getElementsByClassName('floating-image');
        Array.from(images).forEach(img => {
          const d = img.floatingData;
          if (d && d.state === 'focused') {
            resetImageState(img);
          }
        });
      }
    });
  }

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