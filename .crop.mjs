import fs from 'node:fs'; import { PNG } from 'pngjs';
const [src, out, h] = process.argv.slice(2);
const p = PNG.sync.read(fs.readFileSync(src));
const H = Math.min(Number(h), p.height);
const o = new PNG({ width: p.width, height: H });
p.data.copy(o.data, 0, 0, p.width * H * 4);
fs.writeFileSync(out, PNG.sync.write(o));
console.log(out, p.width + 'x' + H);
