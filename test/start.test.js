import { spawn } from 'child_process'
import withLocalTmpDir from 'with-local-tmp-dir'
import expect from 'expect'
import waitForChange from 'wait-for-change'
import importFresh from 'import-fresh'
import { resolve, join } from 'path'
import { outputFile } from 'fs'
import resolveBin from 'resolve-bin'

export const it = () => withLocalTmpDir(__dirname, async () => {
  await outputFile('src/index.js', 'export default 1')

  const childProcess = await spawn(resolveBin.sync('@dword-design/base-node', { executable: 'base-node' }), ['start'])
    .catch(error => {
      if (error.code !== null) {
        throw error
      }
    })
    .childProcess
  try {
    await waitForChange(join('dist', 'index.js'))
    expect(require(resolve('dist'))).toEqual(1)
    await outputFile(join('src', 'index.js'), 'export default 2')
    await waitForChange(join('dist', 'index.js'))
    expect(importFresh(resolve('dist'))).toEqual(2)
  } finally {
    childProcess.kill()
  }
})
export const timeout = 20000
