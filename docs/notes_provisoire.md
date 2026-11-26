# Notes provisoires — écarts de données (DQM2 Offline Compendium)

État au 26 novembre 2026, après l'ajout des fiches **capacités** (特技) et **traits** (特性) et de leurs
descriptions anglaises.

## Ce qui vient d'être comblé

- **303 fiches capacités** (`#/ability/<nom japonais>`) avec, comme sur le site de référence : type, portée,
  coût MP, plafond de dégâts, élément, effet, les capacités du même élément, les compétences qui l'enseignent
  (avec leur SP maximum) et les monstres qui la possèdent.
- **240 fiches traits** (`#/trait/<nom japonais>`) avec l'effet, l'effet **SP** (version SP), les porteurs en
  tant que trait de base / de valeur plus / de taille (M・G・超G), les compétences qui le donnent et les
  builds de renaissance 3DS qui le transmettent.
- **Descriptions anglaises** : 286 textes d'effet de capacités, 240 effets de traits, 162 effets SP de traits.
  Tous les textes japonais d'origine restent affichés à côté.
- Pages listes : chaque ligne renvoie vers sa fiche et affiche la description anglaise.

## Écarts restants

1. **Objets et armes** : les effets (`items.json` → `effect`, `weapons.json` → `effect`) sont toujours en
   japonais, sans rendu anglais. Les noms, prix et sources sont, eux, traités.
2. **Magasins et drops** : les noms de magasins et les lignes de drop des armes restent en japonais.
3. **Arène** : les notes de round et les PV des adversaires restent dans la langue de la source.
4. **Clés d'alchimie** : les titres (称号), conditions et contenus de quête restent en japonais ; seuls les
   noms de clés (moitiés) ont un rendu anglais.
5. **Guides traduits** : à l'intérieur des articles, les noms d'objets, de monstres et de compétences sont
   laissés en japonais pour rester cherchables dans les tableaux.
6. **Coût MP absent à la source** : 30 capacités (danses, capacités SP) n'ont aucun coût MP imprimé ; la fiche
   affiche « — ». Ce n'est pas une donnée manquante du scrape, mais une absence dans la référence.
7. **Porteurs innés** : la source ne liste « 特技を持つモンスター » que sur 33 fiches capacités. Les autres
   affichent « aucun monstre du dex ne la possède innée ; elle s'apprend par compétence ».
8. **Traits à valeur plus** : la référence ne distingue pas +25 / +50 / +★ sur la fiche du trait (une seule
   section « プラス値特性を持つモンスター »). Le palier exact figure sur la fiche du monstre
   (`traits.plus`), pas sur la fiche du trait.
9. **Builds de renaissance** : les noms de builds sont les entrées communautaires japonaises de la source et
   ne sont pas traduits (seule la note chiffrée l'est implicitement par son format).
10. **Voisins d'élément** : la fiche capacité affiche au plus 24 capacités du même élément pour rester lisible.
11. **Habitat des monstres** : absent pour les boss, monstres d'œuf, d'événement et de synthèse (≈ 651 fiches).
12. **Recherche globale** : l'en-tête ne cherche que parmi les monstres (pas les capacités, traits, objets,
    armes).
13. **Pas de tests automatisés** dans le dépôt : la vérification reste `npm run build` + inspection manuelle.

## Comment régénérer

Depuis `data-source/` :

```bash
python3 scrape_details.py     # fiches capacités + traits → ability-detail.json, trait-detail.json
python3 translate_details.py  # descriptions anglaises → i18n-*-desc.json
```

`scrape_details.py` a besoin du réseau (game-cap.com). Les traductions anglaises sont écrites à la main dans
`desc-abilities*.txt` / `desc-traits*.txt` (une ligne numérotée par texte unique) ; le script refuse de produire
un JSON si une ligne manque ou entre en conflit.
