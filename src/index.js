import { spawn } from 'child_process'
import chokidar from 'chokidar'
import debounce from 'debounce'
import { remove } from 'fs'

const lint = () => spawn('eslint', ['--ext', '.js,.json', '--ignore-path', '.gitignore', '.'], { stdio: 'inherit' })

const build = async () => {
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
            if (error.name !== 'ChildProcessError') {
              console.log(error)
            }
          }
        },
        200
      )
    ),
}
