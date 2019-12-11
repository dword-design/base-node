import getDepcheckBabelParser from './get-depcheck-babel-parser'
import depcheckSpawnDetector from './depcheck-spawn-detector'
import depcheck from 'depcheck'
import babelConfig from '@dword-design/babel-config'

export default {
  detectors: [
    depcheck.detector.importDeclaration,
    depcheck.detector.requireCallExpression,
    depcheck.detector.requireResolveCallExpression,
    depcheckSpawnDetector,
  ],
  parsers: {
    '*.js': getDepcheckBabelParser(babelConfig),
  },
  specials: [
    depcheck.special.bin,
  ],
}
