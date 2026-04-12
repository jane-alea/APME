## client-server communication

clients send change requests, each associated with change numbers.

the server...

- ACCEPTS changes whose change number is exactly equal to that of the last change it recorded plus one;
- issues MERGE CONFLICTS when receiving a change whose number is lesser than or equal to the current number, then adds the change to the very top of its stack.

a merge conflict message consists of the last correct number before that sent by the client, as well as an ordered list of the changes which have occured after that last correct number.

upon reception of such a message, the client will rewind back to that last correct number, adding to its local history undos for the actions since, then apply server-sent changes.

## nodes

nodes are communicating elements capable of replicating each other's behaviour, and of performing the basic operations on maps. each node either is the central node, or holds a reference — through some kind of transfer channel — to the central node. non-central nodes will be hereafter referred to as "client nodes".

### node capabilities

1. perform history-recorded operations like placing blocks, creating layers, changing layer modes, etc.
2. hold a copy of the history and of the map, which it strives to keep as accurate to other nodes' copies as possible.
3. synchronisation: on client nodes, this means sending changes for approval to the central node, and processing merge conflicts; on central nodes, it means receiving changes from client nodes, accepting uncontested ones, sorting the others and issuing merge conflicts.

## history

there are two types of history:

- local history,
- shared history.

in practice, both are combined in one, but elements specific to the local history are not shared with others.

selection, and the specific tool you are using are both elements of local history, because it would not be useful to force all users working on a map to use the same tools on the same blocks at the same time.

real changes to the map, on the other hand, are kept on the shared history and synchronised between clients. when appropriate, they will include the current selection and tool state as a "prefix" in order to indicate what the action was carried out on.

history is made out of a linked list of changes; it never goes backwards. in order to "undo" previous changes, reverse actions are added to the history in the reverse order changes were made.

## supported file formats

- Official Protox Map Format (JSON), version 2. v1 maps should be upgraded through the official map editor before being imported into APME
- APME binary map format, all versions

## the APME map format

**FO**: File Only — not stored in memory, but stored on save files

Note that APME chunks will always be 16 blocks wide, tall and deep.

- `name` the name of this map
- `version` **FO** APME map file format version, used for upgrades as needed. currently, `0`
- `skybox`
  - `topColor` color of the top of the skybox (`skClrTop` in the official map format)
  - `middleColor` color of the middle of the skybox (`skClrMiddle` in the official map format)
  - `bottomColor` color of the bottom of the skybox (`skClrBottom` in the official map format)
  - `offset` Y offset of the skybox (`skOffset`)
- `fog`
  - `enabled` whether there is fog (`f0g`)
  - `near` start of the fog (`f0gNr`)
  - `far` end of the fog (`f0gFr`)
  - `color` colour of the fog (`f0gClr`)
- `lightColor` colour that is multiplied componentwise with the map textures' colours (`liClr`)
- `history` a list of the changes to the map
  - `limit` how many changes are saved. it can be as long as desired, but that might lead to large map files
  - `changes` a list of the last up to `self.limit` changes
- `layers` the map's layers, as a list
  - `name` the name of this layer, used mostly for visual identification in the UI. it is not a unique ID
  - `active` whether this layer is active, or, in other words, whether it modifies the map
  - `chunks` 4096 chunks, as a list
    - `empty` whether this chunk has blocks
    - `blocks` if `!self.empty`, contains 4096 blocks
  - `mode` can be either of:
    - `"normal"` zero blocks change nothing; non-zero blocks replace that of all layers under this one
    - `"addition"` blocks only have an effect if there is no lower layer which has a block at that position
    - `"exclusion"` blocks will be removed where this layer has blocks, but nothing will be put in their place
  - `stepAreas` a list of:
    - `position` start position (3-dimensional)
    - `size` size of the area (3-dimensional)
  - `points` a list of:
    - `position` start position (3-dimensional)
    - `size` size of the area (3-dimensional)
  - `spawns` a list of:
    - `position` position (3-dimensional)
    - `orientation` spawn Y-axis rotation, in radians
  - `dummies` a list of:
    - `position` position (3-dimensional)
