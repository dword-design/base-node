import depcheckParserSass from '@dword-design/depcheck-parser-sass'
import loadPkg from 'load-pkg'

import dev from './dev.js'
import lint from './lint.js'
import prepublishOnly from './prepublish-only.js'

export default config => {
  const packageConfig = loadPkg.sync() || {}

  return {
    allowedMatches: ['src'],
    commands: {
      dev,
      prepublishOnly,
    },
    depcheckConfig: {
      parsers: {
        '**/*.scss': depcheckParserSass,
      },
      ...(config.cjsFallback && { ignoreMatches: ['jiti'] }),
    },
    editorIgnore: ['dist'],
    gitignore: ['/dist'],
    lint,
    npmPublish: true,
    packageConfig: {
      main: `dist/${config.cjsFallback ? 'cjs-fallback.cjs' : 'index.js'}`,
      ...(packageConfig.type === 'module' &&
        !config.cjsFallback && {
          exports: './dist/index.js',
        }),
    },
    useJobMatrix: true,
  }
}
