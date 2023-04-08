import { Base } from '@dword-design/base'
import tester from '@dword-design/tester'
import testerPluginTmpDir from '@dword-design/tester-plugin-tmp-dir'
import outputFiles from 'output-files'

import self from './index.js'

export default tester(
  {
    'sass library': async () => {
      await outputFiles({
        'node_modules/foo': {
          'index.scss': '',
          'package.json': JSON.stringify({ main: './index.scss', name: 'foo' }),
        },
        'package.json': JSON.stringify({
          dependencies: {
            foo: '^1.0.0',
          },
          type: 'module',
        }),
        'src/style.scss': "@import '~foo';",
      })

      const base = new Base(self)
      await base.prepare()
      await base.test()
    },
  },
  [testerPluginTmpDir()],
)
