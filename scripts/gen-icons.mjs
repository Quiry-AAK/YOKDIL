// Bağımlılıksız PNG ikon üretici (zlib built-in). Sınav kâğıdı temalı app ikonu.
import { deflateSync } from "zlib";
import { writeFileSync, mkdirSync } from "fs";

const INDIGO = [79, 70, 229];
const BAR = [129, 140, 248];
const WHITE = [255, 255, 255];

const crcTable = (() => {
  const t = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, "ascii");
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crc]);
}
function inRoundedSquare(x, y, size, rad) {
  const cx = Math.min(Math.max(x, rad), size - 1 - rad);
  const cy = Math.min(Math.max(y, rad), size - 1 - rad);
  const dx = x - cx, dy = y - cy;
  return dx * dx + dy * dy <= rad * rad;
}
function inRect(x, y, x0, y0, x1, y1) {
  return x >= x0 && x < x1 && y >= y0 && y < y1;
}

function makeIcon(size, maskable) {
  const rad = maskable ? 0 : size * 0.22;
  const m = maskable ? 0.3 : 0.26; // sayfa yatay marjı
  const pageX0 = size * m, pageX1 = size * (1 - m);
  const pageY0 = size * (maskable ? 0.26 : 0.2), pageY1 = size * (maskable ? 0.74 : 0.8);
  const pageW = pageX1 - pageX0;
  const barX0 = pageX0 + pageW * 0.14, barX1 = pageX1 - pageW * 0.14;
  const barH = size * 0.05;
  const pageH = pageY1 - pageY0;
  const barYs = [0.28, 0.5, 0.72].map((f) => pageY0 + pageH * f - barH / 2);

  const raw = Buffer.alloc((size * 4 + 1) * size);
  let p = 0;
  for (let y = 0; y < size; y++) {
    raw[p++] = 0; // filter
    for (let x = 0; x < size; x++) {
      let col = null;
      const onBar = barYs.some((by) => inRect(x, y, barX0, by, barX1, by + barH));
      if (onBar) col = BAR;
      else if (inRect(x, y, pageX0, pageY0, pageX1, pageY1)) col = WHITE;
      else if (inRoundedSquare(x, y, size, rad)) col = INDIGO;
      if (col) {
        raw[p++] = col[0]; raw[p++] = col[1]; raw[p++] = col[2]; raw[p++] = 255;
      } else {
        raw[p++] = 0; raw[p++] = 0; raw[p++] = 0; raw[p++] = 0;
      }
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

mkdirSync("public/icons", { recursive: true });
writeFileSync("public/icons/icon-192.png", makeIcon(192, false));
writeFileSync("public/icons/icon-512.png", makeIcon(512, false));
writeFileSync("public/icons/icon-512-maskable.png", makeIcon(512, true));
console.log("İkonlar üretildi: public/icons/");
