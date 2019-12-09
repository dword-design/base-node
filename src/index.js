import { spawn } from 'child_process'
import chokidar from 'chokidar'
import debounce from 'debounce'
import { remove, outputFile } from 'fs'
import getPackageName from 'get-package-name'

const lint = () => spawn('eslint', ['--ext', '.js,.json', '--ignore-path', '.gitignore', '.'], { stdio: 'inherit' })

const build = async () => {
  await outputFile('.eslintrc.json', JSON.stringify({ extends: getPackageName(require.resolve('@dword-design/eslint-config')) }, undefined, 2) + '\n')
  await lint()
  await remove('dist')
  await spawn('babel', ['--config-file', getPackageName(require.resolve('@dword-design/babel-config')), '--out-dir', 'dist', '--copy-files', 'src'], { stdio: 'inherit' })
}

export default {
  lint,
  build,
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
  gitignore: [
    '/.eslintrc.json',
  ],
}
