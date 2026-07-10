# Daedalus Engine v5.1

Corrección de la versión móvil.

## Cambios

- `templateStore.js` reconstruido desde cero para evitar errores de sintaxis.
- El SVG del encabezado usa curvas, por lo que COMUNICADO y el logo no dependen de fuentes del dispositivo.
- Recupera la carga automática de:
  - plantilla;
  - texto de ejemplo;
  - firma;
  - fecha.
- Mantiene el Exporter desacoplado de la versión v4, que ya funcionaba en iPhone y escritorio.
