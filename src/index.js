import depcheckParserSass from '@dword-design/depcheck-parser-sass'
import fs from 'fs-extra'
import P from 'path'

import dev from './dev.js'
import lint from './lint.js'
import prepublishOnly from './prepublish-only.js'

export default config => {
  const packageConfig = {
    type: 'module',
    ...(fs.existsSync('package.json') ? fs.readJsonSync('package.json') : {}),
  }

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
        ...(packageConfig.type === 'module' &&
          !config.cjsFallback && {
            exports: './dist/index.js',
          }),
      },
    }),
    useJobMatrix: true,
  }
}
