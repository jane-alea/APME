# This documents the APME binary format with `version = 5`
Changes from V4:  
- Added history entries to the format
- Standardized the block palette and removed the one packed in each file

# Format notes

## Number format

- All numbers are encoded in little endian
- Number formats are specified between brackets. The formats follow the same principle as the Rust programming language's basic number types: a prefix (`i` means signed integer, `u` means unsigned integer, and `f` an IEEE 754 floating-point number) followed by a number suffix indicating its size in bits. Thus, `i32` is a signed 32-bit integer and `f64` is equivalent to the default JavaScript number type.

## Colour format

The only colours used in Protox maps lack an alpha channel, and use eight bits for the three other channels. Hence, colours in this binary format shall be represented by three consecutive octets: one for the red value, one for the green value and one for the blue value.

# Listing

1. First 4 octets: the "magic number" `APME`, in ASCII encoding, or `41 50 4d 45`
2. 1 octet: map version
3. 2 octets: map name octet length [u16]
4. UTF-8 encoded map name
5. 3 octets: skybox top colour
6. 3 octets: skybox middle colour
7. 3 octets: skybox bottom colour
8. 2 octets: skybox offset [i16]
9. 1 octet: whether the fog is enabled (0 is `false`, anything else is `true`)
10. 4 octets: fog near [f32]
11. 4 octets: fog far [f32]
12. 3 octets: fog colour
13. 3 octets: light colour
14. 8 octets: elapsed time, in milliseconds [u64]
15. 8 octets: total blocks changed [u64]
16. 4 octets: total actions [u32]
17. 2 octets: author count [u16]
18. FOR EACH AUTHOR:
    1. UTF-8 encoded author name
19. 2 octets: layer count [u16]
20. FOR EACH LAYER:
    1. 4 octets: layer ID [u32]
    2. 2 octets: layer name length [u16]
    3. UTF-8 encoded layer name
    4. 1 octet: whether this layer is active (0 is `false`, anything else is `true`)
    5. 1 octet: layer mode (0 is normal, 1 is addition and 2 is exclusion)
    6. 2 octets: number of step areas [u16]
    7. FOR EACH STEP AREA:
        1. 4 octets: X coordinate of the start of the step area [f32]
        2. 4 octets: Y coordinate of the start of the step area [f32]
        3. 4 octets: Z coordinate of the start of the step area [f32]
        4. 4 octets: width of the step area [f32]
        5. 4 octets: height of the step area [f32]
        6. 4 octets: depth of the step area [f32]
    8. 2 octets: number of points [u16]
    9. FOR EACH POINT:
        1. 4 octets: X coordinate of the start of the point [f32]
        2. 4 octets: Y coordinate of the start of the point [f32]
        3. 4 octets: Z coordinate of the start of the point [f32]
        4. 4 octets: width of the point [f32]
        5. 4 octets: height of the point [f32]
        6. 4 octets: depth of the point [f32]
    10. 4 octets: number of spawns [u32]
    11. FOR EACH SPAWN:
        1. 4 octets: X coordinate of the spawn [f32]
        2. 4 octets: Y coordinate of the spawn [f32]
        3. 4 octets: Z coordinate of the spawn [f32]
        4. 4 octets: rotation of the spawn [f32]
    12. 4 octets: number of dummies [u32]
    13. FOR EACH DUMMY:
        1. 4 octets: X coordinate of the dummy [f32]
        2. 4 octets: Y coordinate of the dummy [f32]
        3. 4 octets: Z coordinate of the dummy [f32]
        4. 4 octets: X-axis rotation of the dummy [f32]
        5. 4 octets: Y-axis rotation of the dummy [f32]
    14. FOR EACH NON-EMPTY CHUNK:
        1. 2 octets: chunk position [u16]
        2. Run-length encoded chunk data, in the form of [u16] (versioned palette index) then count as [u8]
    15. `0xabcd`, an invalid chunk address, to mark the end of chunks [u16]
21. 2 octets: max history entries; if zero, then the true value is Infinity [u16]
22. 8 octets: current history entry ID [f64]
23. 4 octets: history entries [u32]
24. FOR EACH HISTORY ENTRY:
    1. 8 octets: timestamp [u64]
    2. 4 octets: action ID [u32]
    3. 1 octet: action type [u8]
    4. Action-dependent parsing, see below

# Action-specific parsing

## `0`: AAddDummy & `1`: AUAddDummy
1. 4 octets: layer ID [u32]
2. 4 octets: X coordinate [f32]
3. 4 octets: Y coordinate [f32]
4. 4 octets: Z coordinate [f32]
5. 4 octets: X rotation [f32]
6. 4 octets: Y rotation [f32]

## `2`: AAddPoint, `3`: AUAddPoint, `6`: AAddStepArea, `7`: AUAddStepArea
1. 4 octets: layer ID [u32]
2. 4 octets: start X coordinate [f32]
3. 4 octets: start Y coordinate [f32]
4. 4 octets: start Z coordinate [f32]
5. 4 octets: size X [f32]
6. 4 octets: size Y [f32]
7. 4 octets: size Z [f32]

## `4`: AAddSpawn & `5`: AUAddSpawn
1. 4 octets: layer ID [u32]
2. 4 octets: X coordinate [f32]
3. 4 octets: Y coordinate [f32]
4. 4 octets: Z coordinate [f32]
5. 4 octets: rotation [f32]

## `8`: AChangeLayerActive
1. 4 octets: layer ID [u32]
2. 1 octet: whether the layer was previously active (0 is `false`, anything else is `true`)
3. 1 octet: whether the layer is currently active (0 is `false`, anything else is `true`)

## `9`: ACreateLayer, `10`: AUCreateLayer
1. 2 octets: layer name length [u16]
2. UTF-8 encoded layer name 
3. 4 octets: layer ID [u32]

## `11`: ADeleteLayer, `12`: AUDeleteLayer
1. Layer. This uses the same format as main file serialization step 22.
2. 2 octets: layer index [u16]

## `13`: AFill, `14`: AUFill
1. 1 octet: start X [u8]
2. 1 octet: start Y [u8]
3. 1 octet: start Z [u8]
4. 1 octet: end X [u8]
5. 1 octet: end Y [u8]
6. 1 octet: end Z [u8]
7. 4 octets: block ID [u32]
8. 4 octets: palette count [u16]
9. FOR EACH PALETTE ENTRY:
    1. 4 octets: block ID [u32]
10. 4 octets: previous blocks count [u32]
11. FOR EACH PREVIOUS BLOCK:
    1. 2 octets: index in the palette [u16]
12. 2 octets: layer index [u16]

## `15`: ARemoveDummy, `16`: AURemoveDummy
1. 4 octets: layer ID [u32]
2. 2 octets: index [u16]
3. 4 octets: position X [f32]
4. 4 octets: position Y [f32]
5. 4 octets: position Z [f32]
6. 4 octets: rotation X [f32]
7. 4 octets: rotation Y [f32]

## `17`: ARemovePoint, `18`: AURemovePoint, `21`: ARemoveStepArea, `22`: AURemoveStepArea
1. 4 octets: layer ID [u32]
2. 4 octets: index [u16]
3. 4 octets: start X [f32]
4. 4 octets: start Y [f32]
5. 4 octets: start Z [f32]
6. 4 octets: size X [f32]
7. 4 octets: size Y [f32]
8. 4 octets: size Z [f32]

## `19`: ARemoveSpawn, `20`: AURemoveSpawn
1. 4 octets: layer ID [u32]
2. 2 octets: index [u16]
3. 4 octets: position X [f32]
4. 4 octets: position Y [f32]
5. 4 octets: position Z [f32]
6. 4 octets: rotation [f32]

## `23`: ARenameLayer
1. 4 octets: layer ID [u32]
2. 2 octets: new name length [u16]
3. UTF-8 encoded new layer name
4. 2 octets: old name length [u16]
5. UTF-8 encoded old layer name

## `24`: ARenameMap
1. 2 octets: new name length [u16]
2. UTF-8 encoded new layer name
3. 2 octets: old name length [u16]
4. UTF-8 encoded old layer name

## `25`: ASetBlock
1. 1 octet: position X [u8]
2. 1 octet: position Y [u8]
3. 1 octet: position Z [u8]
4. 4 octets: previous ID [u32]
5. 4 octets: new block ID [u32]
6. 2 octets: layer index [u16]

## `26`: AEditMapSetting
1. 1 octet: map setting key (see below for list of possible values)
2. Format depends on 1.; old value of that format, then new value of that format

### `0`: skyTop, `1`: skyMiddle, `2`: skyBottom, `7`: fogColor
Value is a three-octet colour, wherein each octet represents one of the R, G, B colour channels.

### `3`: skyOffset
Value is a 16-bit signed integer.

### `4`: fogEnabled
Value is a 8-bit unsigned integer. `0` represents `false`, and any other value represents `true`.

### `5`: fogNear, `6`: fogFar
Value is a 32-bit floating-point number.

### `8`: authors
Value is in two parts:
1. 2 octets: author count [u16]
2. FOR EACH AUTHOR:
    1. 2 octets: author name length [u16]
    2. UTF-8 encoded author name

### `9`: maxHistoryActions
Value is an unsigned 16-bit integer. A value of `0` means that infinite actions are saved.