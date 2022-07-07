import depcheckParserSass from '@dword-design/depcheck-parser-sass'

import dev from './dev'
import prepublishOnly from './prepublish-only'

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
  },
  useJobMatrix: true,
}
