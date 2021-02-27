import deleteEmpty from 'delete-empty'
import execa from 'execa'
import { copy, remove } from 'fs-extra'
import micromatch from 'micromatch'
import P from 'path'

import lint from './lint'

export default async options => {
  await lint()
  await remove('dist')
  // https://github.com/babel/babel/issues/11394
  await copy('src', 'dist', {
    filter: path =>
      !micromatch.isMatch(path, [
        '**/*.js',
        '**/__snapshots__',
        '**/__image_snapshots__',
      ]),
  })
  await deleteEmpty(P.resolve('dist'))
  await execa(
    'babel',
    ['--out-dir', 'dist', '--ignore', '**/*.spec.js', '--verbose', 'src'],
    { stdio: options.log === false ? 'pipe' : 'inherit' }
  )
}
