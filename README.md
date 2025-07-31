# Portfolio

TO DO :

_choisir version finale images
_revoir couleurs de fond

_revoir grid mobile pour faire rentrer les textes tout en aggrandissant la typo

_adapter à tous navigateurs (controles natifs safari/mozilla)
_adapter toutes les interactions au format smartphone
_peaufiner affichage sur safari mobile : se fait crop sur iphone -> dvh
_interdire rotation d'écran sur mobile : peut être juste adapter les grilles, pour page projet reprendre grid ordinateur
_dark mode ?

_préparer les contenus textuels en anglais
_script du switch bouton FR/ENG
-> retirer tous les contenus textuels de mes blocs de text (div, p, h1, span etc) pour les mettre dans deux js séparés (un eng un fr) et attribuer un "identifiant de langue" data-i18n pour mapper les contenus aux balises :
1 - <h1 data-i18n="welcome"></h1>
<p data-i18n="about"></p>

2 - {
  "welcome": "Bienvenue",
  "about": "À propos de nous"
}

_pimper logo d'accueil

_optimiser tout pour eco de ressources (voir doc .txt)
