import { Base } from '@dword-design/base'
import { endent, property } from '@dword-design/functions'
import tester from '@dword-design/tester'
import testerPluginTmpDir from '@dword-design/tester-plugin-tmp-dir'
import fs from 'fs-extra'
import { globby } from 'globby'
import outputFiles from 'output-files'
import P from 'path'

import config from './index.js'
import self from './prepublish-only.js'

export default tester(
  {
    'build errors': async () => {
      await fs.outputFile(P.join('src', 'index.js'), 'foo bar')
      await new Base(config).prepare()
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
          'eslint-plugin-foo/index.js': 'foo bar',
        },
        'src/index.js': '',
      })
      await new Base(config).prepare()
      await self({
        resolvePluginsRelativeTo: P.join(
          'node_modules',
          '@dword-design',
          'eslint-config'
        ),
      })
    },
    fixable: async () => {
      await fs.outputFile(P.join('src', 'index.js'), "console.log('foo');")
      await new Base(config).prepare()
      await self()
      expect(await fs.readFile(P.join('src', 'index.js'), 'utf8')).toEqual(
        endent`
        console.log('foo')

      `
      )
    },
    'linting errors': async () => {
      await fs.outputFile(P.join('src', 'index.js'), 'var foo = 2')
      await new Base(config).prepare()
      await expect(self()).rejects.toThrow(
        "'foo' is assigned a value but never used"
      )
      expect(await fs.exists('dist')).toBeFalsy()
    },
    'only copied files': async () => {
      await fs.outputFile(P.join('src', 'test.txt'), 'foo')
      await new Base(config).prepare()
      await self()
      expect(
        await globby('*', { cwd: 'dist', dot: true, onlyFiles: false })
      ).toEqual(['test.txt'])
    },
    snapshots: async () => {
      await outputFiles({
        'dist/foo.js': '',
        src: {
          foo: {
            '__image_snapshots__/foo-snap.png': '',
            '__snapshots__/foo.js.snap': '',
          },
          'index.js': 'export default 1',
        },
      })
      await new Base(config).prepare()
      await self()
      expect(
        await globby('**', { cwd: 'dist', dot: true, onlyFiles: false })
      ).toEqual(['index.js'])
    },
    async valid() {
      await outputFiles({
        'dist/foo.js': '',
        src: {
          'index.js': 'export default 1',
          'index.spec.js': '',
          'test.txt': 'foo',
        },
      })
      await new Base(config).prepare()
      expect(self() |> await |> property('all')).toMatch(
        new RegExp(endent`
      src(\\\\|/)index\\.js -> dist(\\\\|/)index\\.js
      Successfully compiled 1 file with Babel( \\(.*?\\))?\\.$
    `)
      )
      expect(
        await globby('*', { cwd: 'dist', dot: true, onlyFiles: false })
      ).toEqual(['index.js', 'test.txt'])
      expect(
        await fs.readFile(P.join('dist', 'index.js'), 'utf8')
      ).toMatchSnapshot(this)
    },
  },
  [testerPluginTmpDir()]
)
