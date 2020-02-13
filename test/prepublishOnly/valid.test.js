import { spawn } from 'child-process-promise'
import withLocalTmpDir from 'with-local-tmp-dir'
import P from 'path'
import outputFiles from 'output-files'
import glob from 'glob-promise'
import { readFile } from 'fs-extra'
import { endent } from '@dword-design/functions'

export default () => withLocalTmpDir(__dirname, async () => {
  await outputFiles({
    'dist/foo.js': '',
    'package.json': endent`
      {
        "baseConfig": "node",
        "devDependencies": {
          "@dword-design/base-config-node": "^1.0.0"
        }
      }

    `,
    src: {
      'index.js': 'export default 1',
      'index.spec.js': '',
      'test.txt': 'foo',
    },
  })
  await spawn('base', ['prepare'])
  const { stdout } = await spawn('base', ['prepublishOnly'], { capture: ['stdout'] })
  expect(stdout).toEqual('Successfully compiled 1 file with Babel.\n')
  expect(await glob('*', { dot: true, cwd: 'dist' })).toEqual(['index.js', 'test.txt'])
  expect(await readFile('.gitignore', 'utf8')).toMatch('/.eslintrc.json\n')
  expect(require(P.resolve('dist'))).toEqual(1)
})
