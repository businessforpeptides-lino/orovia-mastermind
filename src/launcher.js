// Launcher: changes CWD to the project root then invokes next dev.
// Used by .claude/launch.json so the preview tool can spawn node.exe directly.
const path = require('path');
const projectRoot = path.resolve(__dirname);
process.chdir(projectRoot);
process.argv = [
  process.argv[0],
  path.join(projectRoot, 'node_modules', 'next', 'dist', 'bin', 'next'),
  'dev',
  '--turbopack',
];
require(path.join(projectRoot, 'node_modules', 'next', 'dist', 'bin', 'next'));
