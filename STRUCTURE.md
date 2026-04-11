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