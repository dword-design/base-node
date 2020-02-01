import { spawn } from 'child-process-promise'
import { remove, outputFile } from 'fs-extra'
import getPackageName from 'get-package-name'
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

export default {
  gitignore: ['/.eslintrc.json'],
  commands: {
    prepublishOnly: async () => {
      await lint()
      await remove('dist')
      await spawn('babel', ['--config-file', getPackageName(require.resolve('@dword-design/babel-config')), '--out-dir', 'dist', '--copy-files', 'src'], { stdio: 'inherit' })
    },
    test: lint,
  },
}
