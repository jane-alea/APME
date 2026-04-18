## Actions
### `ACreateLayer`

Create a new layer.

- `layerName` string
- `layerId` number

undo: `AUCreateLayer`

### `ADeleteLayer`

Delete an existing layer, which may have blocks. This is distinct from `AUCreateLayer`.

- `layer` Layer
- `position` number; where the layer was located in the map

undo: `AUDeleteLayer`

### `AUCreateLayer`

Undo of `ACreateLayer`, removes the created layer.

### `AUDeleteLayer`

Undo of `ADeleteLayer`, adds back the deleted layer at its original position.
