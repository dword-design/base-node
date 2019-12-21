import withLocalTmpDir from 'with-local-tmp-dir'
import { spawn } from 'child-process-promise'
import { outputFile } from 'fs-extra'
import expect from 'expect'
import packageConfig from '../package.config'
import outputFiles from 'output-files'
import sortPackageJson from 'sort-package-json'
import waitForChange from 'wait-for-change'
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
