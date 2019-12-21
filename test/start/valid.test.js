import { spawn } from 'child-process-promise'
import withLocalTmpDir from 'with-local-tmp-dir'
import expect from 'expect'
import P from 'path'
import outputFiles from 'output-files'
import packageConfig from '../package.config'
import waitForChange from 'wait-for-change'
import sortPackageJson from 'sort-package-json'
import { outputFile } from 'fs-extra'
import stealthyRequire from 'stealthy-require'
import { endent } from '@dword-design/functions'

export default () => withLocalTmpDir(__dirname, async () => {
  await outputFiles({
    'dist/foo.js': '',
    'package.json': JSON.stringify(sortPackageJson({
      ...packageConfig,
      devDependencies: {
        '@dword-design/base-config-node': '^1.0.0',
      },
    }), undefined, 2),
    src: {
      'index.js': 'export default 1',
      'test.txt': 'foo',
    },
  })
  const childProcess = await spawn('base', ['start'], { capture: ['stdout'] })
    .catch(error => {
      expect(error.stdout).toEqual(endent`
        Copying config files …
        Updating README.md …
        Successfully compiled 1 file with Babel.
        Successfully compiled 1 file with Babel.
      ` + '\n')
      if (error.code !== null) {
        throw error
      }
    })
    .childProcess
  try {
    await waitForChange(P.join('dist', 'index.js'))
    expect(require(P.resolve('dist'))).toEqual(1)
    await outputFile(P.join('src', 'index.js'), 'export default 2')
    await waitForChange(P.join('dist', 'index.js'))
    expect(stealthyRequire(require.cache, () => require(P.resolve('dist')))).toEqual(2)
  } finally {
    childProcess.kill()
  }
})
