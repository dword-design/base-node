import { endent } from '@dword-design/functions'
import { outputFile } from 'fs-extra'
import getPackageName from 'get-package-name'

import dev from './dev'
import lint from './lint'
import prepublishOnly from './prepublish-only'

export default {
  allowedMatches: ['src'],
  commands: {
    dev,
    prepublishOnly,
  },
  editorIgnore: ['.eslintrc.json', 'dist'],
  gitignore: ['/.eslintrc.json', '/dist'],
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
      "extends": "${getPackageName(
        require.resolve('@dword-design/eslint-config')
      )}"
    }

  `
    ),
  useJobMatrix: true,
}
