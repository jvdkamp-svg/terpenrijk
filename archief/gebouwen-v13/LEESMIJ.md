# Gearchiveerde gebouwen (tot en met versie 13.3)

Vanaf versie 13.4 gebruikt Terpenrijk nieuwe, zelf ontworpen gebouwen (`bkit.js` in de broncode).
De vorige gebouwen zijn hier bewaard en niet weggegooid:

- `bld-v12/` — de gebouwen van versie 12 (Higgsfield-ontwerp, SAM 3D-model): `models.bin`, `models.json`, `tex.webp`, atlas.
- `b13-v13/` — de gebouwen van versie 13.2 (Higgsfield, eigen textuuratlas): `b13.bin` + `b13.webp`.
- `bmodel-v13.js`, `models-v13.js`, `render-v13.js` — de code die ze tekende.

Terugzetten: zet `bld-v12` weer neer als `assets/bld` en maak `blddata.js` opnieuw met `tools/bld.py`; `bModel()` gebruikt die modellen dan weer. Voor `b13-v13` is ook de laadfunctie `loadB13()` uit `bmodel-v13.js` nodig.
