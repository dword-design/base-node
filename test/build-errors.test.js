import outputFiles from 'output-files'
import { spawn } from 'child-process-promise'
import withLocalTmpDir from 'with-local-tmp-dir'
import expect from 'expect'
import { outputFile } from 'fs-extra'
import waitForChange from 'wait-for-change'
import { minimalPackageConfig, minimalProjectConfig } from '@dword-design/base'
import sortPackageJson from 'sort-package-json'
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
      'src/index.js': 'foo bar',
    })
    let stdout
    try {
      await spawn('base', ['build'], { capture: ['stdout'] })
    } catch (error) {
      stdout = error.stdout
    }
    expect(stdout).toMatch('Unexpected token, expected ";"')
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
    await waitForChange(P.join('dist', 'index.js'))
    expect(require(P.resolve('dist'))).toEqual(1)
    await outputFile(P.resolve('src', 'index.js'), 'foo bar')
    await new Promise(resolve => childProcess.stdout.on('data', data => {
      if (data.toString().includes('Unexpected token, expected ";"')) {
        resolve()
      }
    }))
    await childProcess.kill()
  })
}

export const timeout = 20000
