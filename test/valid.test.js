import { spawn } from 'child_process'
import withLocalTmpDir from 'with-local-tmp-dir'
import expect from 'expect'
import P from 'path'
import outputFiles from 'output-files'
import { minimalProjectConfig, minimalPackageConfig } from '@dword-design/base'
import waitForChange from 'wait-for-change'
import sortPackageJson from 'sort-package-json'
import glob from 'glob-promise'
import { outputFile } from 'fs'
import stealthyRequire from 'stealthy-require'
import { endent } from '@functions'

export const it = async () => {

  const files = {
    ...minimalProjectConfig,
    'dist/foo.js': '',
    'package.json': JSON.stringify(sortPackageJson({
      ...minimalPackageConfig,
      devDependencies: {
        '@dword-design/base-config-node': '^1.0.0',
      },
    }), undefined, 2),
    'src/test.txt': 'foo',
  }

  await withLocalTmpDir(__dirname, async () => {
    await outputFiles(files)
    const { stdout } = await spawn('base', ['build'], { capture: ['stdout'] })
    expect(stdout).toEqual(endent`
      Copying config files …
      Updating README.md …
      Successfully compiled 1 file with Babel.
    ` + '\n')
    expect(await glob('*', { cwd: 'dist' })).toEqual(['index.js', 'test.txt'])
    expect(require(P.resolve('dist'))).toEqual(1)
  })

  await withLocalTmpDir(__dirname, async () => {
    await outputFiles(files)
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
}

export const timeout = 20000
