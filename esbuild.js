var esbuild = require('esbuild');
var globby = require('globby');
var path = require('path');
var rootPath = path.resolve(__dirname);

async function _findEntryPoints() {
  const files = await globby([
    path.resolve(rootPath, 'src/**/*.ts'),
    path.resolve(rootPath, 'src/**/*.tsx'),
  ]);

  return files.filter((file) => {
    return (
      !file.includes('__fixtures__') &&
      !file.endsWith('.workshop.tsx') &&
      !file.endsWith('.test.ts') &&
      !file.endsWith('.stories.tsx') &&
      !file.endsWith('.test.tsx')
    );
  });
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
        // external: ['@playwright/test'],
      })
      .catch(() => process.exit(1));
  });
}

main();
