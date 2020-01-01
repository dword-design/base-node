import { spawn } from 'child-process-promise'
import withLocalTmpDir from 'with-local-tmp-dir'
import expect from 'expect'
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
      'test.txt': 'foo',
    },
  })
  const { stdout } = await spawn('base', ['build'], { capture: ['stdout'] })
  expect(stdout).toEqual('Successfully compiled 1 file with Babel.\n')
  expect(await glob('*', { dot: true })).toEqual([
    '.editorconfig',
    '.eslintrc.json',
    '.gitignore',
    '.gitpod.yml',
    '.renovaterc.json',
    '.travis.yml',
    'dist',
    'LICENSE.md',
    'package.json',
    'README.md',
    'src',
  ])
  expect(await glob('*', { dot: true, cwd: 'dist' })).toEqual(['index.js', 'test.txt'])
  expect(await readFile('.gitignore', 'utf8')).toMatch('/.eslintrc.json\n')
  expect(require(P.resolve('dist'))).toEqual(1)
})
