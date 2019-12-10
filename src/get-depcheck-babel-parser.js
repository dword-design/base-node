import { parseSync } from '@babel/core'

export default babelConfig => content => parseSync(content, babelConfig)
