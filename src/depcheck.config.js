import getBabelParser from '@dword-design/get-depcheck-babel-parser'
import spawnDetector from '@dword-design/depcheck-spawn-detector'
import depcheck from 'depcheck'
import babelConfig from '@dword-design/babel-config'

export default {
  detectors: [
    depcheck.detector.importDeclaration,
    depcheck.detector.requireCallExpression,
    depcheck.detector.requireResolveCallExpression,
    spawnDetector,
  ],
  parsers: {
    '*.js': getBabelParser(babelConfig),
  },
  specials: [
    depcheck.special.bin,
  ],
}
