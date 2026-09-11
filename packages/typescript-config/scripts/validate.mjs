import { readFile } from 'node:fs/promises';

const configFiles = ['base.json', 'node.json', 'react.json'];

for (const configFile of configFiles) {
  const config = JSON.parse(await readFile(new URL(`../${configFile}`, import.meta.url), 'utf8'));

  if (
    !config.compilerOptions ||
    (config.compilerOptions.strict !== true && configFile === 'base.json')
  ) {
    throw new Error(`${configFile} does not contain the expected compiler options`);
  }
}

console.log(`Validated ${configFiles.length} shared TypeScript configurations.`);
