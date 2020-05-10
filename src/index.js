import lint from './lint'
import dev from './dev'
import prepublishOnly from './prepublish-only'

export default {
  gitignore: ['/.eslintrc.json'],
  test: lint,
  commands: {
    dev,
    prepublishOnly,
  },
}
