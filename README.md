# Portfolio

TO DO :

_page de projets_clic :

    - low res : soit line blanc sur fond transparent (low-line-transp) plus élégant moins visible
                soit line noir sur fond blanc (low-line) plus simple plus voyant

    - crop des images en bordure de la zone d'apparition (section-clic) : RÉGLÉE dans getRandomPosition avec un padding à la zone différenciée entre mobile et desktop

    - player media audio et video combinés et simplifiés (play btn et progress bar) : pour vidéo, thumbnail supplémentaire (thumbnail high-res)
    -> "je ne veux pas que le thumbnail apparaissent lorsque la vidéo est en pause ! Seulement avant et après la lecture complète"

    - pour régler taille image regarder après "// TAILLES IMAGES"
    dimensions du format carré scaled down (*0.75) pour équilibrer avec les autres format (éviter que les carrés soient gigantesques)
    -ordi : aggrandir images (toutes mais surtout paysage)
    -sur mobile : - aggrandir un peu les images, et accélérer un peu leur vitesse de déplacement

    - pour régler vitesses des images ("//IMAGES SPEED") dans les deux scripts ! index et projets
    
    - apparition des images encore foireuse sur mobile
         sur desktop, l'affichage automatique des premières images peut ne pas toujours apparaitre, sur mobile aussi mais uniquement si on s'est promené rapidement dans les sections, sinon sur mobile le mouvement des elements inactifs n'est pas toujuors fonctionnel
         sur desktop, si on interagis avec les éléments d'une section, les deux prochains sections visitées n'auront pas d'image affichées automatiquement, si on n'intéragis pas avec ces deux sections, la troisième aura une image

_adapter à tous navigateurs (controles natifs safari/mozilla)

_optimiser tout pour eco de ressources (voir doc .txt)