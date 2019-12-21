import { spawn } from 'child-process-promise'
import chokidar from 'chokidar'
import debounce from 'debounce'
import { remove, outputFile } from 'fs-extra'
import getPackageName from 'get-package-name'
import babelConfig from '@dword-design/babel-config'
import depcheckConfig from './depcheck.config'
import { flatMap } from '@dword-design/functions'
import P from 'path'

const lint = async () => {
  await outputFile('.eslintrc.json', JSON.stringify({ extends: getPackageName(require.resolve('@dword-design/eslint-config')) }, undefined, 2) + '\n')
  const workspaces = require(P.resolve('package.json')).workspaces ?? []
  await spawn(
    'eslint',
    [
      '--ext', '.js,.json',
      '--ignore-path', '.gitignore',
      ...workspaces |> flatMap(pattern => ['--ignore-pattern', pattern]),
      '.',
    ],
    { stdio: 'inherit' }
  )
}

const build = async () => {
  await lint()
  await remove('dist')
  await spawn('babel', ['--config-file', getPackageName(require.resolve('@dword-design/babel-config')), '--out-dir', 'dist', '--copy-files', 'src'], { stdio: 'inherit' })
}

export default {
  babelConfig,
  build,
  depcheckConfig,
  gitignore: ['/.eslintrc.json'],
  lint,
  start: () => chokidar
    .watch('src')
    .on(
      'all',
      debounce(
        async () => {
          try {
            await build()
          } catch (error) {
            console.log(error)
          }
        },
        200
      )
    ),
}
