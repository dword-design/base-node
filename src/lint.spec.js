import { endent } from '@dword-design/functions'
import execa from 'execa'
import { readFile } from 'fs-extra'
import outputFiles from 'output-files'
import P from 'path'
import withLocalTmpDir from 'with-local-tmp-dir'

import lint from './lint'

export default {
  fixable: () =>
    withLocalTmpDir(async () => {
      await outputFiles({
        'node_modules/base-config-self/index.js':
          "module.exports = require('../../../src')",
        'package.json': JSON.stringify(
          {
            baseConfig: 'self',
          },
          undefined,
          2
        ),
        'src/index.js': "console.log('foo');",
      })
      await execa.command('base prepare')
      await lint()
      expect(await readFile(P.join('src', 'index.js'), 'utf8')).toEqual(
        endent`
          console.log('foo')

        `
      )
    }),
  'linting errors': () =>
    withLocalTmpDir(async () => {
      await outputFiles({
        'node_modules/base-config-self/index.js':
          "module.exports = require('../../../src')",
        'package.json': JSON.stringify(
          {
            baseConfig: 'self',
          },
          undefined,
          2
        ),
        'src/index.js': "const foo = 'bar'",
      })
      await execa.command('base prepare')
      await expect(lint()).rejects.toThrow(
        "foo' is assigned a value but never used"
      )
    }),
  'plugin next to config': () =>
    withLocalTmpDir(async () => {
      await outputFiles({
        node_modules: {
          '@dword-design/eslint-config': {
            'index.js': endent`
              module.exports = {
                plugins: ['foo'],
              }

            `,
            'node_modules/eslint-plugin-foo/index.js': '',
          },
          'base-config-self/index.js':
            "module.exports = require('../../../src')",
          'eslint-plugin-foo/index.js': 'foo bar',
        },
        'package.json': JSON.stringify(
          {
            baseConfig: 'self',
          },
          undefined,
          2
        ),
        'src/index.js': '',
      })
      await execa.command('base prepare')
      await lint({
        resolvePluginsRelativeTo: P.join(
          'node_modules',
          '@dword-design',
          'eslint-config'
        ),
      })
    }),
}
