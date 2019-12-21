import { spawn } from 'child-process-promise'
import withLocalTmpDir from 'with-local-tmp-dir'
import outputFiles from 'output-files'
import packageConfig from '../package.config'
import sortPackageJson from 'sort-package-json'

export default () => withLocalTmpDir(__dirname, async () => {
  await outputFiles({
    'package.json': JSON.stringify(sortPackageJson({
      ...packageConfig,
      workspaces: ['packages/*'],
      devDependencies: {
        '@dword-design/base-config-node': '^1.0.0',
      },
    }), undefined, 2),
    'packages/a': {
      'package.json': JSON.stringify({
        name: 'a',
        scripts: {
          prepublishOnly: 'echo ""',
        },
      }),
      'src/index.js': 'foo bar',
    },
  })
  await spawn('base', ['build'])
})
