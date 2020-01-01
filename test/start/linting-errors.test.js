import withLocalTmpDir from 'with-local-tmp-dir'
import { spawn } from 'child-process-promise'
import { outputFile } from 'fs-extra'
import outputFiles from 'output-files'
import { endent } from '@dword-design/functions'

export default () => withLocalTmpDir(__dirname, async () => {
  await outputFiles({
    'package.json': endent`
      {
        "baseConfig": "node",
        "devDependencies": {
          "@dword-design/base-config-node": "^1.0.0"
        }
      }

    `,
    'src/index.js': 'export default foo',
  })
  const childProcess = spawn('base', ['start'], { stdio: ['ignore', 'pipe', 'ignore'] })
    .catch(error => {
      if (error.code !== null) {
        throw error
      }
    })
    .childProcess
  await new Promise(resolve => childProcess.stdout.on('data', data => {
    if (data.toString().includes('error  \'foo\' is not defined  no-undef')) {
      resolve()
    }
  }))
  childProcess.stdout.removeAllListeners('data')
  await outputFile('src/index.js', 'export default 2;')
  await new Promise(resolve => childProcess.stdout.on('data', data => {
    if (data.toString().includes('error  Extra semicolon  semi')) {
      resolve()
    }
  }))
  childProcess.stdout.removeAllListeners('data')
  childProcess.stdout.destroy()
  childProcess.kill()
})
