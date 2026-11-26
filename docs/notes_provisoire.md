# Notes provisoires — écarts de données (DQM2 Offline Compendium)

État au 26 novembre 2026, après l'ajout des fiches **capacités** (特技) et **traits** (特性), de leurs
descriptions anglaises, puis des effets d'**objets** et d'**armes**.

## Ce qui vient d'être comblé

- **303 fiches capacités** (`#/ability/<nom japonais>`) avec, comme sur le site de référence : type, portée,
  coût MP, plafond de dégâts, élément, effet, les capacités du même élément, les compétences qui l'enseignent
  (avec leur SP maximum) et les monstres qui la possèdent.
- **240 fiches traits** (`#/trait/<nom japonais>`) avec l'effet, l'effet **SP** (version SP), les porteurs en
  tant que trait de base / de valeur plus / de taille (M・G・超G), les compétences qui le donnent et les
  builds de renaissance 3DS qui le transmettent.
- **Descriptions anglaises** : 286 textes d'effet de capacités, 240 effets de traits, 162 effets SP de traits,
  245 effets d'objets et 74 effets d'armes. Tous les textes japonais d'origine restent affichés à côté.
- Effets d'objets et d'armes : composition automatique pour les motifs (créations d'objets apprenant une
  compétence, listes de bonus de matériaux) et dictionnaires écrits à la main pour le reste, dans
  `data-source/translate_effects.py`.
- Pages listes : chaque ligne renvoie vers sa fiche et affiche la description anglaise.

## Écarts restants

1. **Effets absents à la source** : 13 armes n'ont aucun texte d'effet dans la référence et affichent « — ».
   Les 255 objets ont tous un effet (245 textes uniques, certains partagés).
2. **Magasins et drops** : les noms de magasins et les lignes de drop des armes restent en japonais (les
   entrées de drop sont liées à la fiche anglaise quand le nom correspond).
3. **Arène** : les conseils de coupe, les notes de round, les PV des adversaires (`約50`) et certains noms de
   monstres de round absents du dex restent dans la langue de la source.
4. **Clés d'alchimie** : les 186 titres (称号) et conditions restent en japonais ; les noms de clés (moitiés),
   les 9 types de quête et les récompenses ont un rendu anglais.
5. **Obtention des compétences** : les mentions de fusion de clé (74) et d'autres modes d'obtention (109)
   restent en japonais.
6. **Guides traduits** : à l'intérieur des articles, les noms d'objets, de monstres et de compétences sont
   laissés en japonais pour rester cherchables dans les tableaux.
7. **Coût MP absent à la source** : 30 capacités (danses, capacités SP) n'ont aucun coût MP imprimé ; la fiche
   affiche « — ». Ce n'est pas une donnée manquante du scrape, mais une absence dans la référence.
8. **Porteurs innés** : la source ne liste « 特技を持つモンスター » que sur 33 fiches capacités. Les autres
   affichent « aucun monstre du dex ne la possède innée ; elle s'apprend par compétence ».
9. **Traits à valeur plus** : la référence ne distingue pas +25 / +50 / +★ sur la fiche du trait (une seule
   section « プラス値特性を持つモンスター »). Le palier exact figure sur la fiche du monstre
   (`traits.plus`), pas sur la fiche du trait.
10. **Builds de renaissance** : les noms de builds sont les entrées communautaires japonaises de la source et
   ne sont pas traduits (seule la note chiffrée l'est implicitement par son format).
11. **Voisins d'élément** : la fiche capacité affiche au plus 24 capacités du même élément pour rester lisible.
12. **Habitat des monstres** : absent pour les boss, monstres d'œuf, d'événement et de synthèse (≈ 651 fiches).
13. **Recherche globale** : l'en-tête ne cherche que parmi les monstres (pas les capacités, traits, objets,
    armes).
14. **Pas de tests automatisés** dans le dépôt : la vérification reste `npm run build` + inspection manuelle.

## Comment régénérer

Depuis `data-source/` :

```bash
python3 scrape_details.py     # fiches capacités + traits → ability-detail.json, trait-detail.json
python3 translate_details.py  # descriptions anglaises → i18n-*-desc.json
python3 translate_effects.py  # effets d'objets et d'armes → i18n-item-desc.json, i18n-weapon-desc.json
```

`scrape_details.py` a besoin du réseau (game-cap.com). Les traductions anglaises sont écrites à la main dans
`desc-abilities*.txt` / `desc-traits*.txt` (une ligne numérotée par texte unique), et les effets d'objets/d'armes
dans les dictionnaires de `translate_effects.py` (les motifs sont composés). Les deux scripts refusent de produire
un JSON si un texte reste sans équivalent.
