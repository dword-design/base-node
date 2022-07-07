import tester from '@dword-design/tester'
import testerPluginTmpDir from '@dword-design/tester-plugin-tmp-dir'
import execa from 'execa'
import outputFiles from 'output-files'

export default tester(
  {
    'sass library': async () => {
      await outputFiles({
        node_modules: {
          'base-config-self/index.js':
            "module.exports = require('../../../src')",
          'foo/index.scss': '',
        },
        'package.json': JSON.stringify(
          {
            baseConfig: 'self',
            dependencies: {
              foo: '^1.0.0',
            },
          },
          undefined,
          2
        ),
        'src/style.scss': "@import '~foo';",
      })
      await execa.command('base prepare')
      await execa.command('base test')
    },
  },
  [testerPluginTmpDir()]
)
