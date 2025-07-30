
/* SCRIPT GESTION DES STYLE HOVER DU MENU */

document.addEventListener("DOMContentLoaded", function () {
  const hoverables = document.querySelectorAll('.hoverable');

  function applyHoverClasses(target) {
    hoverables.forEach(el => el.classList.remove('hovered-focus', 'hovered'));
    target.classList.add('hovered-focus');
    hoverables.forEach(el => {
      if (el !== target) el.classList.add('hovered');
    });
  }

  function resetHoverClasses() {
    hoverables.forEach(el => el.classList.remove('hovered-focus', 'hovered'));
  }

  hoverables.forEach(el => {
    el.addEventListener('mouseenter', () => applyHoverClasses(el));
    el.addEventListener('mouseleave', resetHoverClasses);
    el.addEventListener('click', e => {
      e.stopPropagation();
      applyHoverClasses(el);
    });
    el.addEventListener('touchstart', e => {
      e.stopPropagation();
      applyHoverClasses(el);
    });
  });

  document.addEventListener('click', resetHoverClasses);
  document.addEventListener('touchend', resetHoverClasses);
});




/* SCRIPT UNIVERSEL - FORÇAGE PORTRAIT */

(function() {
    'use strict';
    
    // Configuration
    const CONFIG = {
        maxWidth: 1024,           // Largeur max 768 pour considérer comme mobile, 1024 pour forcer aussi sur tablettes
        enableIndicator: true,   // Afficher l'indicateur de rotation
        enableNativeLock: true,  // Tenter le verrouillage natif
        enableAutoRefresh: true  // Rafraîchir automatiquement après rotation
    };
    
    let orientationLocked = false;
    let rotationActive = false;
    
    // Classe principale de gestion de l'orientation
    class PortraitForcer {
        constructor() {
            this.init();
        }
        
        init() {
            // this.createIndicator();
            this.bindEvents();
            this.checkOrientation();
            
            // Tentative de verrouillage après interaction utilisateur
            if (CONFIG.enableNativeLock) {
                this.setupNativeLock();
            }
        }
        
        // createIndicator() {
        //     if (!CONFIG.enableIndicator) return;
            
        //     const indicator = document.createElement('div');
        //     indicator.className = 'portrait-indicator';
        //     indicator.innerHTML = '📱 Mode portrait forcé';
        //     indicator.id = 'portraitIndicator';
        //     document.body.appendChild(indicator);
        // }
        
        bindEvents() {
            // Événements d'orientation
            window.addEventListener('orientationchange', () => {
                setTimeout(() => this.handleOrientationChange(), 100);
            });
            
            // Événement de redimensionnement
            let resizeTimer;
            window.addEventListener('resize', () => {
                clearTimeout(resizeTimer);
                resizeTimer = setTimeout(() => this.checkOrientation(), 250);
            });
            
            // Gestion de la visibilité de la page
            document.addEventListener('visibilitychange', () => {
                if (!document.hidden && CONFIG.enableNativeLock) {
                    setTimeout(() => this.attemptNativeLock(), 100);
                }
            });
        }
        
        checkOrientation() {
            const isLandscape = window.innerHeight < window.innerWidth;
            const isMobile = window.innerWidth <= CONFIG.maxWidth;
            const shouldRotate = isLandscape && isMobile;
            
            if (shouldRotate !== rotationActive) {
                rotationActive = shouldRotate;
                // this.updateIndicator();
                
                if (CONFIG.enableAutoRefresh && shouldRotate) {
                    this.refreshPage();
                }
            }
        }
        
        handleOrientationChange() {
            this.checkOrientation();
            
            // Forcer un recalcul des dimensions après rotation
            setTimeout(() => {
                window.dispatchEvent(new Event('resize'));
            }, 300);
        }
        
        // updateIndicator() {
        //     if (!CONFIG.enableIndicator) return;
            
        //     const indicator = document.getElementById('portraitIndicator');
        //     if (indicator) {
        //         indicator.style.display = rotationActive ? 'block' : 'none';
        //     }
        // }
        
        setupNativeLock() {
            // Attendre une interaction utilisateur pour tenter le verrouillage
            const events = ['click', 'touchstart', 'keydown'];
            const lockHandler = () => {
                this.attemptNativeLock();
                // Supprimer les écouteurs après la première tentative
                events.forEach(event => {
                    document.removeEventListener(event, lockHandler);
                });
            };
            
            events.forEach(event => {
                document.addEventListener(event, lockHandler, { 
                    once: true, 
                    passive: true 
                });
            });
        }
        
        attemptNativeLock() {
            if (orientationLocked || !screen.orientation || !screen.orientation.lock) {
                return;
            }
            
            // Essayer différentes options de verrouillage
            const lockOptions = ['portrait-primary', 'portrait'];
            
            const tryLock = (index = 0) => {
                if (index >= lockOptions.length) {
                    console.log('Verrouillage d\'orientation non supporté');
                    return;
                }
                
                screen.orientation.lock(lockOptions[index])
                    .then(() => {
                        orientationLocked = true;
                        console.log(`Orientation verrouillée: ${lockOptions[index]}`);
                    })
                    .catch(() => {
                        tryLock(index + 1);
                    });
            };
            
            tryLock();
        }
        
        refreshPage() {
            // Optionnel: rafraîchir certains éléments après rotation
            // Utile pour les animations ou composants qui pourraient se casser
            setTimeout(() => {
                // Relancer les animations CSS si nécessaire
                const animatedElements = document.querySelectorAll('[style*="animation"]');
                animatedElements.forEach(el => {
                    const animation = el.style.animation;
                    el.style.animation = 'none';
                    el.offsetHeight; // Force reflow
                    el.style.animation = animation;
                });
                
                // Déclencher un événement personnalisé pour les scripts tiers
                window.dispatchEvent(new CustomEvent('portraitForced', {
                    detail: { rotationActive }
                }));
            }, 100);
        }
        
        // Méthodes publiques pour l'API
        getCurrentState() {
            return {
                rotationActive,
                orientationLocked,
                isLandscape: window.innerHeight < window.innerWidth,
                isMobile: window.innerWidth <= CONFIG.maxWidth
            };
        }
        
        // destroy() {
        //     // Nettoyer les événements et éléments créés
        //     const indicator = document.getElementById('portraitIndicator');
        //     if (indicator) {
        //         indicator.remove();
        //     }
        // }
    }
    
    // Auto-initialisation quand le DOM est prêt
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.portraitForcer = new PortraitForcer();
        });
    } else {
        window.portraitForcer = new PortraitForcer();
    }
    
    // API globale pour les développeurs
    window.PortraitForcer = {
        getInstance: () => window.portraitForcer,
        getState: () => window.portraitForcer?.getCurrentState() || null,
        
        // Configuration runtime
        configure: (newConfig) => {
            Object.assign(CONFIG, newConfig);
            if (window.portraitForcer) {
                window.portraitForcer.checkOrientation();
            }
        }
    };
    
})();