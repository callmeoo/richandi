import {buildSync} from 'esbuild';
import {mkdirSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
mkdirSync('.sites-runtime',{recursive:true});
buildSync({entryPoints:['tests/scheduling.test.ts'],bundle:true,platform:'node',format:'cjs',outfile:'.sites-runtime/scheduling.test.cjs'});
execFileSync(process.execPath,['.sites-runtime/scheduling.test.cjs'],{stdio:'inherit'});
