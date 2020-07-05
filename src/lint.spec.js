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
        'package.json': endent`
        {
          "baseConfig": "node",
          "devDependencies": {
            "@dword-design/base-config-node": "^1.0.0"
          }
        }

      `,
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
        'package.json': endent`
        {
          "baseConfig": "node",
          "devDependencies": {
            "@dword-design/base-config-node": "^1.0.0"
          }
        }

      `,
        'src/index.js': "const foo = 'bar'",
      })
      await execa.command('base prepare')
      await expect(lint()).rejects.toThrow(
        "foo' is assigned a value but never used"
      )
    }),
}
