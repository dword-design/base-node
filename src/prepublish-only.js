import packageName from 'depcheck-package-name'
import execa from 'execa'
import { remove } from 'fs-extra'

import lint from './lint'

export default async options => {
  await lint()
  await remove('dist')
  await execa(
    'babel',
    [
      '--config-file',
      packageName`@dword-design/babel-config`,
      '--out-dir',
      'dist',
      '--copy-files',
      '--no-copy-ignored',
      '--ignore',
      '**/*.spec.js',
      '--verbose',
      'src',
    ],
    { stdio: options.log === false ? 'pipe' : 'inherit' }
  )
}
