OSM_js_editor
=============

**Ce projet a fait son temps, si vous cherchez une lib d'édition OSM digne de ce nom, jetez plutôt un coup d'oeil à [osm-request](https://github.com/osmlab/osm-request)**

Lib js d'édition OSM, issue du projet OpenBeerMap.

Permet d'éditer les tags des objets OSM (node, way, relation) et d'ajouter / supprimer des éléments dans des relations.

/!\ si vous réalisez un éditeur OSM avec cette librairie, il est de votre responsabilité de vous assurer que vous respectez les bonnes pratiques de contributions.

## Authentification
Les deux modes d'authentification d'OSM sont supportées : basic_auth (par login / mot de pase) et avec Oauth (méthode recommandée).

Pour l'utiliser, renseigner les informations dans le fichier auth.js (en s'inspirant de default.auth.js)

Pour utiliser Oauth, il faut poser le fichier land.html à côté de la page où l'authentification se déroulera et enregistrer son application : https://www.openstreetmap.org/user/your_OSM_login>/oauth_clients/new

## Exemples d'utilisation

* exemple simple dans le présent repo
* exemple simple, avec Vue Form Generator, dans le présent repo
* OpenBeerMap (pour un formulaire plus complexe)

## Utilisation

* On utilisera `get_node_or_way` pour récupérer les infos sur un objet existant
* On utilisera `edit_tag`, `del_tag`, `del_rel_member`, etc pour modifier un objet existant
* On utilisera `send_data_to_osm` pour persister les modifications sur un objet en les envoyant à l'API OSM

## Limites

* La gestion des conflits n'est pas implémentée
* etc
