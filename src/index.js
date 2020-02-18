import lint from './lint'
import prepublishOnly from './prepublish-only'

export default {
  gitignore: ['/.eslintrc.json'],
  test: lint,
  commands: {
    prepublishOnly,
  },
}
