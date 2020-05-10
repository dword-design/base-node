import outputFiles from 'output-files'
import withLocalTmpDir from 'with-local-tmp-dir'
import execa from 'execa'
import { endent } from '@dword-design/functions'
import { readFile } from 'fs-extra'
import P from 'path'
import lint from './lint'

export default {
  'linting errors': () => withLocalTmpDir(async () => {
    await outputFiles({
      'package.json': endent`
        {
          "baseConfig": "node",
          "devDependencies": {
            "@dword-design/base-config-node": "^1.0.0"
          }
        }

      `,
      'src/index.js': 'foo bar',
    })
    await execa.command('base prepare')
    await expect(lint()).rejects.toThrow('Parsing error')
  }),
  fixable: () => withLocalTmpDir(async () => {
    await outputFiles({
      'package.json': endent`
        {
          "baseConfig": "node",
          "devDependencies": {
            "@dword-design/base-config-node": "^1.0.0"
          }
        }

      `,
      'src/index.js': 'console.log(\'foo\');',
    })
    await execa.command('base prepare')
    await lint()
    expect(await readFile(P.join('src', 'index.js'), 'utf8')).toEqual('console.log(\'foo\')')
  }),
}