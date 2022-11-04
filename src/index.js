import depcheckParserSass from '@dword-design/depcheck-parser-sass'
import loadPkg from 'load-pkg'

import dev from './dev'
import prepublishOnly from './prepublish-only'

const packageConfig = loadPkg.sync() || {}

export default {
  allowedMatches: ['src'],
  commands: {
    dev,
    prepublishOnly,
  },
  depcheckConfig: {
    parsers: {
      '**/*.scss': depcheckParserSass,
    },
  },
  editorIgnore: ['dist'],
  gitignore: ['/dist'],
  npmPublish: true,
  packageConfig: {
    main: 'dist/index.js',
    ...(packageConfig.type === 'module' && { exports: './dist/index.js' }),
  },
  useJobMatrix: true,
}
