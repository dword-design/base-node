import withLocalTmpDir from 'with-local-tmp-dir'
import { spawn } from 'child-process-promise'
import { exists } from 'fs-extra'
import outputFiles from 'output-files'
import { endent } from '@dword-design/functions'

export default async () => withLocalTmpDir(__dirname, async () => {
  await outputFiles({
    'package.json': endent`
      {
        "baseConfig": "node",
        "devDependencies": {
          "@dword-design/base-config-node": "^1.0.0"
        }
      }

    `,
    'src/index.js': 'console.log(\'hi\');',
  })
  await spawn('base', ['prepare'])
  let stdout
  try {
    await spawn('base', ['prepublishOnly'], { capture: ['stdout'] })
  } catch (error) {
    stdout = error.stdout
  }
  expect(stdout).toMatch('error  Extra semicolon  semi')
  expect(await exists('dist')).toBeFalsy()
})

