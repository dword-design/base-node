import tester from '@dword-design/tester'
import testerPluginTmpDir from '@dword-design/tester-plugin-tmp-dir'
import outputFiles from 'output-files'
import stealthyRequire from 'stealthy-require-no-leak'

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

      const base = stealthyRequire(require.cache, () =>
        require('@dword-design/base')
      )
      await base.prepare()
      await base.test()
    },
  },
  [testerPluginTmpDir()]
)
