import { endent, property } from '@dword-design/functions'
import tester from '@dword-design/tester'
import testerPluginTmpDir from '@dword-design/tester-plugin-tmp-dir'
import { exists, readFile } from 'fs-extra'
import globby from 'globby'
import outputFiles from 'output-files'
import P from 'path'
import stealthyRequire from 'stealthy-require-no-leak'

import self from './prepublish-only'

export default tester(
  {
    'build errors': async () => {
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

      const base = stealthyRequire(require.cache, () =>
        require('@dword-design/base')
      )
      await base.prepare()
      await expect(self()).rejects.toThrow(
        'Parsing error: Missing semicolon. (1:3)'
      )
    },
    'eslint plugin next to eslint config': async () => {
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

      const base = stealthyRequire(require.cache, () =>
        require('@dword-design/base')
      )
      await base.prepare()
      await self({
        resolvePluginsRelativeTo: P.join(
          'node_modules',
          '@dword-design',
          'eslint-config'
        ),
      })
    },
    fixable: async () => {
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

      const base = stealthyRequire(require.cache, () =>
        require('@dword-design/base')
      )
      await base.prepare()
      await self()
      expect(await readFile(P.join('src', 'index.js'), 'utf8')).toEqual(
        endent`
        console.log('foo')

      `
      )
    },
    'linting errors': async () => {
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

      const base = stealthyRequire(require.cache, () =>
        require('@dword-design/base')
      )
      await base.prepare()
      await expect(self()).rejects.toThrow(
        "'foo' is assigned a value but never used"
      )
      expect(await exists('dist')).toBeFalsy()
    },
    'only copied files': async () => {
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

      const base = stealthyRequire(require.cache, () =>
        require('@dword-design/base')
      )
      await base.prepare()
      await self()
      expect(
        await globby('*', { cwd: 'dist', dot: true, onlyFiles: false })
      ).toEqual(['test.txt'])
    },
    snapshots: async () => {
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

      const base = stealthyRequire(require.cache, () =>
        require('@dword-design/base')
      )
      await base.prepare()
      await base.prepublishOnly()
      expect(
        await globby('**', { cwd: 'dist', dot: true, onlyFiles: false })
      ).toEqual(['index.js'])
    },
    valid: async () => {
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

      const base = stealthyRequire(require.cache, () =>
        require('@dword-design/base')
      )
      await base.prepare()
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
    },
  },
  [testerPluginTmpDir()]
)
