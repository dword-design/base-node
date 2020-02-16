import { spawn } from 'child-process-promise'
import { remove, outputFile, copy, stat } from 'fs-extra'
import getPackageName from 'get-package-name'

const lint = async () => {
  await outputFile('.eslintrc.json', JSON.stringify({ extends: getPackageName(require.resolve('@dword-design/eslint-config')) }, undefined, 2) + '\n')
  try {
    await spawn('eslint', ['--ext', '.js,.json', '--ignore-path', '.gitignore', '.'], { capture: ['stdout'] })
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
      await copy(
        'src',
        'dist',
        { filter: async file => (file |> stat |> await).isDirectory() || !file.endsWith('.js') },
      )
      await spawn(
        'babel',
        [
          '--config-file', getPackageName(require.resolve('@dword-design/babel-config')),
          '--out-dir', 'dist',
          '--ignore', '**/*.spec.js',
          'src',
        ],
        { stdio: 'inherit' },
      )
    },
  },
}
