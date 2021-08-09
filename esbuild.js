var esbuild = require('esbuild');
var globby = require('globby');

async function _findEntryPoints() {
  const files = await globby([
    'src/**/*.ts',
    'src/**/*.tsx',
  ]);

  return files;
}

function main() {
  _findEntryPoints().then((result) => {  
    esbuild
      .build({
        entryPoints: result,
        bundle: false,
        outdir: 'dist',
        format: 'cjs',
        sourcemap: 'external',
        platform: 'node',    
      })
      .catch(() => process.exit(1));
  });
}

main();
