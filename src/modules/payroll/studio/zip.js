const crcTable = (() => { const t = []; for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++)
        c = c & 1 ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    t[i] = c >>> 0;
} return t; })();
function crc32(u8) { let c = 0xffffffff; for (const b of u8)
    c = crcTable[(c ^ b) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; }
function u16(a, v) { a.push(v & 255, (v >>> 8) & 255); }
function u32(a, v) { a.push(v & 255, (v >>> 8) & 255, (v >>> 16) & 255, (v >>> 24) & 255); }
function zipStore(files) {
    const enc = new TextEncoder(), chunks = [], central = [];
    let offset = 0;
    for (const f of files) {
        const name = enc.encode(f.name), data = enc.encode(f.content), crc = crc32(data), lh = [];
        u32(lh, 0x04034b50);
        u16(lh, 20);
        u16(lh, 0);
        u16(lh, 0);
        u16(lh, 0);
        u16(lh, 0);
        u32(lh, crc);
        u32(lh, data.length);
        u32(lh, data.length);
        u16(lh, name.length);
        u16(lh, 0);
        chunks.push(new Uint8Array(lh), name, data);
        const ch = [];
        u32(ch, 0x02014b50);
        u16(ch, 20);
        u16(ch, 20);
        u16(ch, 0);
        u16(ch, 0);
        u16(ch, 0);
        u16(ch, 0);
        u32(ch, crc);
        u32(ch, data.length);
        u32(ch, data.length);
        u16(ch, name.length);
        u16(ch, 0);
        u16(ch, 0);
        u16(ch, 0);
        u16(ch, 0);
        u32(ch, 0);
        u32(ch, offset);
        central.push(new Uint8Array(ch), name);
        offset += lh.length + name.length + data.length;
    }
    const centralSize = central.reduce((a, b) => a + b.length, 0), end = [];
    u32(end, 0x06054b50);
    u16(end, 0);
    u16(end, 0);
    u16(end, files.length);
    u16(end, files.length);
    u32(end, centralSize);
    u32(end, offset);
    u16(end, 0);
    return new Blob([...chunks, ...central, new Uint8Array(end)], { type: 'application/zip' });
}
export { zipStore };
