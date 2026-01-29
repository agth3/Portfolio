# Portfolio

TO DO :

_page de projets bis :$4

    - low res : soit line blanc sur fond transparent (low-line-transp) plus élégant moins visible
                soit line noir sur fond blanc (low-line) plus simple plus voyant

    - crop des images en bordure de la zone d'apparition (section-clic) : réglée dans getRandomPosition avec un padding à la zone différenciée entre mobile et desktop

    - apparition des images encore foireuse sur mobile
         sur desktop, l'affichage automatique des premières images peut ne pas toujours apparaitre, sur mobile aussi mais uniquement si on s'est promené rapidement dans les sections, sinon sur mobile le mouvement des elements inactifs n'est pas toujuors fonctionnel
         sur desktop, si on interagis avec les éléments d'une section, les deux prochains sections visitées n'auront pas d'image affichées automatiquement, si on n'intéragis pas avec ces deux sections, la troisième aura une image

    - player media audio et video combinés et simplifiés (play btn et progress bar) : pour vidéo, thumbnail supplémentaire (thumbnail high-res)
    -> "je ne veux pas que le thumbnail apparaissent lorsque la vidéo est en pause ! Seulement avant et après la lecture complète"

    -ordi : aggrandir images (toutes mais surtout paysage)
    -sur mobile : - aggrandir un peu les images, et accélérer un peu leur vitesse de déplacement
    -global : changer titre "démo iframe just click"

    - dernière modif : 
    test console incompris "Uncaught ReferenceError: projectStates is not defined
    at <anonymous>:3:3
(anonyme)	@	VM7181:3
setInterval		
(anonyme)	@	VM7181:1"
sur mobile, les éléments inactifs sont en mouvement pendant quelques apparitions ensuite c'est une chance sur deux - ils bougent ou se stoppent au fur et à mesure des autres apparitions, par contre l'apparition automatique du premier média est complètement opérationnelle
sur desktop, les éléments inactifs sont bien toujours en mouvement, par contre l'apparition automatique du premier élément peut ne pas suivre si on se promène trop vite entre les sections (ou que l'on fait des allers-retours)

_adapter à tous navigateurs (controles natifs safari/mozilla)
    - controles audio à pimper pour safari (et centrer bouton play audio)

_optimiser tout pour eco de ressources (voir doc .txt)