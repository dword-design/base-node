import { property } from '@dword-design/functions'
import deleteEmpty from 'delete-empty'
import execa from 'execa'
import { copy, remove } from 'fs-extra'
import micromatch from 'micromatch'
import P from 'path'
import stdEnv from 'std-env'

export default async options => {
  options = {
    log: !stdEnv.test,
    resolvePluginsRelativeTo: require.resolve('@dword-design/eslint-config'),
    ...options,
  }

  const output = { all: '' }
  try {
    output.all +=
      execa(
        'eslint',
        [
          '--fix',
          '--ext',
          '.js,.json',
          '--ignore-path',
          '.gitignore',
          '--resolve-plugins-relative-to',
          options.resolvePluginsRelativeTo,
          '.',
        ],
        options.log ? { stdio: 'inherit' } : { all: true }
      )
      |> await
      |> property('all')
  } catch (error) {
    throw new Error(error.all)
  }
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
  output.all +=
    execa(
      'babel',
      ['--out-dir', 'dist', '--ignore', '**/*.spec.js', '--verbose', 'src'],
      options.log ? { stdio: 'inherit' } : { all: true }
    )
    |> await
    |> property('all')

  return output
}
