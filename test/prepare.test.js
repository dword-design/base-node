import { spawn } from 'child_process'
import withLocalTmpDir from 'with-local-tmp-dir'
import expect from 'expect'
import { resolve } from 'path'
import outputFiles from 'output-files'
import resolveBin from 'resolve-bin'
import { minimalProjectConfig } from '@dword-design/base'

export const it = () => withLocalTmpDir(__dirname, async () => {
  await outputFiles({
    ...minimalProjectConfig,
    'src/index.js': 'export default 1',
  })
  await spawn(
    resolveBin.sync('@dword-design/base-node', { executable: 'base-node' }),
    ['prepare']
  )
  expect(require(resolve('dist'))).toEqual(1)
})
export const timeout = 10000
