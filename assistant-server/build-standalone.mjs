import {readFileSync,writeFileSync} from 'node:fs';
const code=readFileSync(new URL('worker.mjs',import.meta.url),'utf8');
const knowledge=readFileSync(new URL('knowledge.mjs',import.meta.url),'utf8').replace('export default ','const profile=');
writeFileSync(new URL('DEPLOY-WORKER.js',import.meta.url),code.replace("import profile from './knowledge.mjs';",knowledge));
console.log('Standalone Dashboard worker built. Add a Workers AI binding named AI.');
