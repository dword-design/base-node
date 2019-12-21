import withLocalTmpDir from 'with-local-tmp-dir'
import { spawn } from 'child-process-promise'
import { exists } from 'fs-extra'
import expect from 'expect'
import packageConfig from '../package.config'
import outputFiles from 'output-files'
import sortPackageJson from 'sort-package-json'

export default async () => withLocalTmpDir(__dirname, async () => {
  await outputFiles({
    'package.json': JSON.stringify(sortPackageJson({
      ...packageConfig,
      devDependencies: {
        '@dword-design/base-config-node': '^1.0.0',
      },
    }), undefined, 2),
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

