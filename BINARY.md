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
14. 2 octets: palette count [u16]
15. FOR EACH PALETTE ENTRY (note that palette entries are block IDs, which fit within 3 octets):
    1. 2 octets: upper 2 octets of the block ID [u16]
    2. 1 octet: lower octet of the block ID [u8]
16. 2 octets: layer count [u16]
17. FOR EACH LAYER:
    1. 2 octets: layer name length [u16]
    2. UTF-8 encoded layer name
    3. 1 octet: layer mode (0 is normal, 1 is addition and 2 is exclusion)
    4. 2 octets: number of step areas [u16]
    5. FOR EACH STEP AREA:
       1. 1 octet: X coordinate of the start of the step area [u8]
       2. 1 octet: Y coordinate of the start of the step area [u8]
       3. 1 octet: Z coordinate of the start of the step area [u8]
       4. 1 octet: width of the step area [u8]
       5. 1 octet: height of the step area [u8]
       6. 1 octet: depth of the step area [u8]
    6. 2 octets: number of points [u16]
    7. FOR EACH POINT:
       1. 1 octet: X coordinate of the start of the point [u8]
       2. 1 octet: Y coordinate of the start of the point [u8]
       3. 1 octet: Z coordinate of the start of the point [u8]
       4. 1 octet: width of the point [u8]
       5. 1 octet: height of the point [u8]
       6. 1 octet: depth of the point [u8]
    8. 2 octets: number of spawns [u16]
    9. FOR EACH SPAWN:
       1. 4 octets: X coordinate of the spawn [f32]
       2. 4 octets: Y coordinate of the spawn [f32]
       3. 4 octets: Z coordinate of the spawn [f32]
       4. 4 octets: rotation of the spawn [f32]
    10. 2 octets: number of dummies [u16]
    11. FOR EACH DUMMY:
        1. 4 octets: X coordinate of the dummy [f32]
        2. 4 octets: Y coordinate of the dummy [f32]
        3. 4 octets: Z coordinate of the dummy [f32]
    12. CHUNKS: All chunks are sequentially encoded. A counter is started at 0. When an empty chunk is encountered, the counter is increased by one. Right before processing a non-empty chunk, as well as at the end of the procedure, or if the counter reaches `255`, if the counter is non-zero, it is pushed as a [u8], and reset to 0. When a non-empty chunk is encountered, 0 [u8] is pushed, then the chunk data is composed of the following, until all of the chunk's blocks have been run through:
        1. 1 OR 2 octets, using the smallest size that suffices to hold the total of palette entries: block ID [u8 or u16]
        2. 1 octet: number of consecutive identical entries, for a maximum of 255 [u8]
18. 2 octets: max history entries [u16]
19. 2 octets: history entries [u16]
