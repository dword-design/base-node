import { endent } from '@dword-design/functions'
import packageName from 'depcheck-package-name'
import { outputFile } from 'fs-extra'

import dev from './dev'
import lint from './lint'
import prepublishOnly from './prepublish-only'

export default {
  allowedMatches: ['/.eslintrc.json', 'src'],
  commands: {
    dev,
    prepublishOnly,
  },
  editorIgnore: ['.eslintrc.json', 'dist'],
  gitignore: ['/dist'],
  lint,
  npmPublish: true,
  packageConfig: {
    main: 'dist/index.js',
  },
  prepare: () =>
    outputFile(
      '.eslintrc.json',
      endent`
    {
      "extends": "${packageName`@dword-design/eslint-config`}"
    }

  `
    ),
  useJobMatrix: true,
}
