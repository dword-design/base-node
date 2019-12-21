import { spawn } from 'child-process-promise'
import withLocalTmpDir from 'with-local-tmp-dir'
import expect from 'expect'
import outputFiles from 'output-files'
import { outputFile } from 'fs-extra'
import waitForChange from 'wait-for-change'
import packageConfig from '../package.config'
import sortPackageJson from 'sort-package-json'
import P from 'path'

export default () => withLocalTmpDir(__dirname, async () => {
  await outputFiles({
    'package.json': JSON.stringify(sortPackageJson({
      ...packageConfig,
      devDependencies: {
        '@dword-design/base-config-node': '^1.0.0',
      },
    }), undefined, 2),
    'src/index.js': 'export default 1',
  })
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
