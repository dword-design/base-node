import depcheckParserSass from '@dword-design/depcheck-parser-sass'
import fs from 'fs-extra'
import loadPkg from 'load-pkg'
import P from 'path'

import dev from './dev.js'
import lint from './lint.js'
import prepublishOnly from './prepublish-only.js'

export default config => {
  const packageConfig = loadPkg.sync() || {}

  const packageType = packageConfig.type || 'module'

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
    ...(fs.existsSync(P.join('src', 'index.js')) && {
      packageConfig: {
        main: `dist/${config.cjsFallback ? 'cjs-fallback.cjs' : 'index.js'}`,
        ...(packageType === 'module' &&
          !config.cjsFallback && {
            exports: './dist/index.js',
          }),
      },
    }),
    useJobMatrix: true,
  }
}
