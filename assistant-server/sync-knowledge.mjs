import {readFileSync,writeFileSync,existsSync} from 'node:fs';
const root=new URL('../',import.meta.url);
const source=existsSync(new URL('dist/profile.json',root))?'dist/profile.json':'profile.json';
const profile=JSON.parse(readFileSync(new URL(source,root),'utf8'));
writeFileSync(new URL('knowledge.mjs',import.meta.url),'export default '+JSON.stringify(profile,null,2)+';\n');
