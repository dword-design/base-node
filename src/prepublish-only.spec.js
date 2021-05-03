import { endent, property } from '@dword-design/functions'
import execa from 'execa'
import { exists, readFile } from 'fs-extra'
import globby from 'globby'
import outputFiles from 'output-files'
import P from 'path'
import withLocalTmpDir from 'with-local-tmp-dir'

import self from './prepublish-only'

export default {
  'build errors': () =>
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
        'src/index.js': 'foo bar',
      })
      await execa.command('base prepare')
      await expect(self()).rejects.toThrow(
        `${P.join('src', 'index.js')}: Missing semicolon. (1:3)`
      )
    }),
  'eslint plugin next to eslint config': () =>
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
      await self({
        resolvePluginsRelativeTo: P.join(
          'node_modules',
          '@dword-design',
          'eslint-config'
        ),
      })
    }),
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
      await self()
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
        'src/index.js': 'var foo = 2',
      })
      await execa.command('base prepare')
      await expect(self()).rejects.toThrow(
        "'foo' is assigned a value but never used"
      )
      expect(await exists('dist')).toBeFalsy()
    }),
  'only copied files': () =>
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
        src: {
          'test.txt': 'foo',
        },
      })
      await execa.command('base prepare')
      await self()
      expect(
        await globby('*', { cwd: 'dist', dot: true, onlyFiles: false })
      ).toEqual(['test.txt'])
    }),
  snapshots: () =>
    withLocalTmpDir(async () => {
      await outputFiles({
        'dist/foo.js': '',
        'node_modules/base-config-self/index.js':
          "module.exports = require('../../../src')",
        'package.json': JSON.stringify(
          {
            baseConfig: 'self',
          },
          undefined,
          2
        ),
        src: {
          foo: {
            '__image_snapshots__/foo-snap.png': '',
            '__snapshots__/foo.js.snap': '',
          },
          'index.js': 'export default 1',
        },
      })
      await execa.command('base prepare')
      await execa.command('base prepublishOnly')
      expect(
        await globby('**', { cwd: 'dist', dot: true, onlyFiles: false })
      ).toEqual(['index.js'])
    }),
  valid: () =>
    withLocalTmpDir(async () => {
      await outputFiles({
        'dist/foo.js': '',
        'node_modules/base-config-self/index.js':
          "module.exports = require('../../../src')",
        'package.json': JSON.stringify(
          {
            baseConfig: 'self',
          },
          undefined,
          2
        ),
        src: {
          'index.js': 'export default 1',
          'index.spec.js': '',
          'test.txt': 'foo',
        },
      })
      await execa.command('base prepare')
      expect(self() |> await |> property('all')).toMatch(
        new RegExp(endent`
        ^src(\\\\|/)index\\.js -> dist(\\\\|/)index\\.js
        Successfully compiled 1 file with Babel( \\(.*?\\))?\\.$
      `)
      )
      expect(
        await globby('*', { cwd: 'dist', dot: true, onlyFiles: false })
      ).toEqual(['index.js', 'test.txt'])
      expect(require(P.resolve('dist'))).toEqual(1)
    }),
}
