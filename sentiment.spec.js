'use strict'

var _sentiment = require('./sentiment')

var _sentiment2 = _interopRequireDefault(_sentiment)

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('Annotator', () => {
  let annotator

  describe('SentimentAnnotator', () => {
    beforeEach(() => {
      annotator = new _sentiment2.default()
    })

    it('should have a proper pipeline', () => {
      expect(annotator.pipeline()).to.deep.equal(['sentiment'])
    })

    it('should have the proper default options', () => {
      expect(annotator.options()).to.deep.equal({})
    })
  })
})