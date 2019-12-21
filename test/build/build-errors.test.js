import outputFiles from 'output-files'
import { spawn } from 'child-process-promise'
import withLocalTmpDir from 'with-local-tmp-dir'
import expect from 'expect'
import packageConfig from '../package.config'
import sortPackageJson from 'sort-package-json'

export default () => withLocalTmpDir(__dirname, async () => {
  await outputFiles({
    'package.json': JSON.stringify(sortPackageJson({
      ...packageConfig,
      devDependencies: {
        '@dword-design/base-config-node': '^1.0.0',
      },
    }), undefined, 2),
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
