import { spawn } from 'child-process-promise'
import withLocalTmpDir from 'with-local-tmp-dir'
import outputFiles from 'output-files'
import { endent } from '@dword-design/functions'
import expect from 'expect'
import P from 'path'

export default () => withLocalTmpDir(__dirname, async () => {
  await outputFiles({
    'package.json': endent`
      {
        "baseConfig": "node",
        "workspaces": ["packages/*"],
        "devDependencies": {
          "@dword-design/base-config-node": "^1.0.0"
        }
      }

    `,
    'packages/a': {
      'package.json': endent`
        {
          "name": "a",
          "scripts": {
            "prepublishOnly": "echo \\"\\""
          }
        }

      `,
      'src/index.js': 'export default 1',
    },
  })
  await spawn('base', ['build'])
  expect(require(P.resolve('packages', 'a', 'dist'))).toEqual(1)
})
