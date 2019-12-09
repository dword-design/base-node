import { spawn } from 'child_process'
import chokidar from 'chokidar'
import debounce from 'debounce'
import { remove, outputFile } from 'fs'
import eslintConfig from './eslint.config'

const lint = () => spawn('eslint', ['--ext', '.js,.json', '--ignore-path', '.gitignore', '.'], { stdio: 'inherit' })

const build = async () => {
  await outputFile('.eslintrc.json', JSON.stringify(eslintConfig, undefined, 2))
  await lint()
  await remove('dist')
  await spawn('babel', ['--out-dir', 'dist', '--copy-files', 'src'], { stdio: 'inherit' })
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
}
