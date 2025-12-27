// config.js - Configuration globale pour tous les chemins d'assets
// À charger en PREMIER dans toutes les pages HTML

(function() {
  'use strict';
  
  // ===== DÉTECTION DE L'ENVIRONNEMENT =====
  const isGitHubPages = window.location.hostname.includes('github.io');
  const pathSegments = window.location.pathname.split('/').filter(Boolean);
  
  // Calcul du basePath
  let basePath = '';
  if (isGitHubPages && pathSegments.length > 0) {
    basePath = '/' + pathSegments[0] + '/';
  }
  
  // ===== CONFIGURATION GLOBALE =====
  window.APP_CONFIG = {
    basePath: basePath,
    isGitHubPages: isGitHubPages,
    isDevelopment: !isGitHubPages,
    
    /**
     * Fonction principale pour corriger les chemins d'assets
     * @param {string} path - Chemin relatif ou absolu
     * @returns {string} - Chemin absolu corrigé
     */
    fixPath: function(path) {
      // Si null ou undefined
      if (!path) return '';
      
      // Si déjà un chemin absolu (http/https), retourner tel quel
      if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
      }
      
      // Si le chemin commence par '/', ajouter le basePath après
      if (path.startsWith('/')) {
        return this.basePath + path.substring(1);
      }
      
      // Éviter les doublons de basePath
      if (path.startsWith(this.basePath)) {
        return path;
      }
      
      // Chemin relatif : ajouter le basePath
      return this.basePath + path;
    },
    
    /**
     * Alias court pour faciliter l'utilisation
     * @param {string} path - Chemin de l'image
     * @returns {string} - Chemin corrigé
     */
    img: function(path) {
      return this.fixPath(path);
    },
    
    /**
     * Pour les vidéos
     */
    video: function(path) {
      return this.fixPath(path);
    },
    
    /**
     * Pour les audios
     */
    audio: function(path) {
      return this.fixPath(path);
    },
    
    /**
     * Pour tout autre asset
     */
    asset: function(path) {
      return this.fixPath(path);
    }
  };
  
  // ===== LOGS DE DEBUG (à commenter en production) =====
  console.log('🔧 APP_CONFIG loaded:', {
    basePath: window.APP_CONFIG.basePath,
    isGitHubPages: window.APP_CONFIG.isGitHubPages,
    isDevelopment: window.APP_CONFIG.isDevelopment,
    currentURL: window.location.href,
    pathname: window.location.pathname
  });
  
  // Test rapide
  const testPath = 'asset/img/test.png';
  console.log('📁 Path transformation test:', {
    input: testPath,
    output: window.APP_CONFIG.fixPath(testPath)
  });
  
})();