import { endent } from '@dword-design/functions'
import { outputFile } from 'fs-extra'
import getPackageName from 'get-package-name'
import lint from './lint'
import dev from './dev'
import prepublishOnly from './prepublish-only'

export default {
  allowedMatches: ['src'],
  gitignore: ['/.eslintrc.json'],
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
  test: lint,
  commands: {
    dev,
    prepublishOnly,
  },
}
