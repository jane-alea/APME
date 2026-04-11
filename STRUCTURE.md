## client-server communication
clients send change requests, each associated with change numbers.

the server...
- ACCEPTS changes whose change number is exactly equal to that of the last change it recorded plus one;
- issues MERGE CONFLICTS when receiving a change whose number is lesser than or equal to the current number, then adds the change to the very top of its stack.

a merge conflict message consists of the last correct number before that sent by the client, as well as an ordered list of the changes which have occured after that last correct number.

upon reception of such a message, the client will rewind back to that last correct number, adding to its local history undos for the actions since, then apply server-sent changes.