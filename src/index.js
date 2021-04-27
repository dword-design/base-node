import dev from './dev'
import prepublishOnly from './prepublish-only'

export default {
  allowedMatches: ['src'],
  commands: {
    dev,
    prepublishOnly,
  },
  editorIgnore: ['dist'],
  gitignore: ['/dist'],
  npmPublish: true,
  packageConfig: {
    main: 'dist/index.js',
  },
  useJobMatrix: true,
}
