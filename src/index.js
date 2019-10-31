#!/usr/bin/env node

const { babelConfigFilename, base, eslintConfigFilename } = require('@dword-design/base-core')
const { remove } = require('fs-extra')
const { spawn } = require('child-process-promise')

base({
  prepare: async () => {
    await remove('dist')
    await spawn('eslint', ['--config', eslintConfigFilename, '--ignore-path', '.gitignore', '.'], { stdio: 'inherit' })
    await spawn('babel', ['--out-dir', 'dist', '--config-file', babelConfigFilename, 'src'], { stdio: 'inherit' })
  },
  start: async () => {
    const watcher = chokidar.watch('src')
    watcher.on(
      'all',
      debounce(
        async () => {
          try {
            await prepare()
          } catch (error) {
            if (error.name !== 'ChildProcessError') {
              console.log(error)
            }
          }
        },
        200
      )
    )
  }
})
