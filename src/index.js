import { spawn } from 'child-process-promise'
import { remove, outputFile } from 'fs-extra'
import getPackageName from 'get-package-name'
import { flatMap } from '@dword-design/functions'
import P from 'path'
import safeRequire from 'safe-require'

const lint = async () => {
  await outputFile('.eslintrc.json', JSON.stringify({ extends: getPackageName(require.resolve('@dword-design/eslint-config')) }, undefined, 2) + '\n')
  const workspaces = safeRequire(P.join(process.cwd(), 'package.json'))?.workspaces ?? []
  try {
    await spawn(
      'eslint',
      [
        '--ext', '.js,.json',
        '--ignore-path', '.gitignore',
        ...workspaces |> flatMap(pattern => ['--ignore-pattern', pattern]),
        '.',
      ],
      { capture: ['stdout'] },
    )
  } catch ({ stdout }) {
    throw new Error(stdout)
  }
}

export default {
  gitignore: ['/.eslintrc.json'],
  test: lint,
  commands: {
    prepublishOnly: async () => {
      await lint()
      await remove('dist')
      await spawn(
        'babel',
        [
          '--config-file', getPackageName(require.resolve('@dword-design/babel-config')),
          '--out-dir', 'dist',
          '--copy-files', 'src',
        ],
        { stdio: 'inherit' },
      )
    },
  },
}
