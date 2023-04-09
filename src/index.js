import depcheckParserSass from '@dword-design/depcheck-parser-sass'

import dev from './dev.js'
import prepublishOnly from './prepublish-only.js'

export default config => ({
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
    main: `dist/${config.cjsFallback ? 'cjs-fallback.cjs' : 'index.js'}`,
    ...(config.packageConfig.type === 'module' &&
      !config.cjsFallback && {
        exports: config.packageConfig.exports,//'./dist/index.js',
      }),
  },
  useJobMatrix: true,
})
