import withLocalTmpDir from 'with-local-tmp-dir'
import { spawn } from 'child_process'
import { exists, outputFile } from 'fs'
import expect from 'expect'
import { minimalPackageConfig, minimalProjectConfig } from '@dword-design/base'
import outputFiles from 'output-files'
import sortPackageJson from 'sort-package-json'
import waitForChange from 'wait-for-change'
import P from 'path'

export const it = async () => {

  const files = {
    ...minimalProjectConfig,
    'package.json': JSON.stringify(sortPackageJson({
      ...minimalPackageConfig,
      devDependencies: {
        '@dword-design/base-config-node': '^1.0.0',
      },
    }), undefined, 2),
  }

  await withLocalTmpDir(__dirname, async () => {
    await outputFiles({
      ...files,
      'src/index.js': 'console.log(\'hi\');',
    })
    let stdout
    try {
      await spawn('base', ['build'], { capture: ['stdout'] })
    } catch (error) {
      stdout = error.stdout
    }
    expect(stdout).toMatch('error  Extra semicolon  semi')
    expect(await exists('dist')).toBeFalsy()
  })

  await withLocalTmpDir(__dirname, async () => {
    await outputFiles(files)
    const childProcess = spawn('base', ['start'])
      .catch(error => {
        if (error.code !== null) {
          throw error
        }
      })
      .childProcess
    await waitForChange('dist/index.js')
    expect(require(P.resolve('dist'))).toEqual(1)
    await outputFile('src/index.js', 'export default 2;')
    await new Promise(resolve => childProcess.stdout.on('data', data => {
      if (data.toString().includes('error  Extra semicolon  semi')) {
        resolve()
      }
    }))
    await childProcess.kill()
  })
}

export const timeout = 20000
