import execa from 'execa'
import { endent } from '@dword-design/functions'
import { outputFile } from 'fs-extra'
import getPackageName from 'get-package-name'

export default async () => {
  await outputFile(
    '.eslintrc.json',
    endent`
    {
      "extends": "${getPackageName(
        require.resolve('@dword-design/eslint-config')
      )}"
    }

  `
  )
  try {
    await execa.command(
      'eslint --fix --ext .js,.json --ignore-path .gitignore .',
      { all: true }
    )
  } catch ({ all }) {
    throw new Error(all)
  }
}
