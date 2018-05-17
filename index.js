var _corenlp = require('corenlp')

var _pipeline = require('corenlp/dist/pipeline')

var _sentence = require('corenlp/dist/simple/sentence')

var _token = require('corenlp/dist/simple/token')

var _governor = require('corenlp/dist/simple/governor')

var _sentiment = require('./sentiment')

var _sentiment2 = _interopRequireDefault(_sentiment)

var _lodash = require('lodash.head')

var _lodash2 = _interopRequireDefault(_lodash)

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//Add annotator class to defaults
_corenlp.default.simple.annotator['SentimentAnnotator'] = _sentiment2.default

//Add sentiment to const used by pipeline
const ANNOTATORS_BY_KEY = {
  tokenize: _corenlp.default.simple.annotator.TokenizerAnnotator,
  ssplit: _corenlp.default.simple.annotator.WordsToSentenceAnnotator,
  pos: _corenlp.default.simple.annotator.POSTaggerAnnotator,
  lemma: _corenlp.default.simple.annotator.MorphaAnnotator,
  ner: _corenlp.default.simple.annotator.NERClassifierCombiner,
  parse: _corenlp.default.simple.annotator.ParserAnnotator,
  depparse: _corenlp.default.simple.annotator.DependencyParseAnnotator,
  relation: _corenlp.default.simple.annotator.RelationExtractorAnnotator,
  regexner: _corenlp.default.simple.annotator.RegexNERAnnotator,
  coref: _corenlp.default.simple.annotator.CorefAnnotator,
  sentiment: _sentiment2.default
}

//Override pipeline._getAnnotators to use this.ANNOTATORS_BY_KEY
_pipeline.default.prototype._getAnnotators = function() {
  return this._getAnnotatorsKeys().map(annotatorKey => ANNOTATORS_BY_KEY[annotatorKey])
}

//Override pipeline._getAnnotatrosOptions to use this.ANNOTATORS_BY_KEY 
_pipeline.default.prototype._getAnnotatrosOptions = function() {
  const pipelineProps = this._properties.getProperties()
  const validPrfixes = Object.keys(ANNOTATORS_BY_KEY)
  return Object.keys(pipelineProps).filter(propName => validPrfixes.indexOf(propName) === 0).reduce((acc, val, key) => _extends({}, acc, { [key]: val }), {})
}

//Override sentence.toJSON to include sentiment and sentimentTree
_sentence.default.prototype.toJSON = function() {
  let json = {
    index: this._index,
    tokens: this._tokens.map(token => token.toJSON()),
    basicDependencies: this._governors.map(governor => governor.toJSON()),
    enhancedDependencies: this._enhancedDependencies,
    enhancedPlusPlusDependencies: this._enhancedPlusPlusDependencies
  }

  if (this._parse) {
    json = _extends({}, json, { parse: this._parse })
  }
  
  if (this._sentiment) {
    json = _extends({}, json, { sentiment: this._sentiment, sentimentTree: this._sentimentTree })
  }

  return json;
}

//Override sentence.fromJSON to add sentiment and sentimentTree
_sentence.default.prototype.fromJSON = function(data, isSentence = false) {
  const sentence = isSentence ? data : (0, _lodash2.default)(data.sentences)
  this._index = data.index;
  if (sentence.tokens) {
    this.addAnnotator(_corenlp.default.simple.annotator.TokenizerAnnotator)
    this._tokens = sentence.tokens.map(tok => _token.default.fromJSON(tok))
  }
  if (sentence.parse) {
    this.addAnnotator(_corenlp.default.simple.annotator.ParserAnnotator)
    this._parse = sentence.parse;
  }
  if (sentence.basicDependencies) {
    this.addAnnotator(_corenlp.default.simple.annotator.DependencyParseAnnotator)
    this._governors = sentence.basicDependencies.map(gov => new _governor.default(gov.dep, this._tokens[gov.dependent - 1], this._tokens[gov.governor - 1]))
    // @see relation annotator...
    this._basicDependencies = sentence.basicDependencies
    this._enhancedDependencies = sentence.enhancedDependencies
    this._enhancedPlusPlusDependencies = sentence.enhancedPlusPlusDependencies
  }
  if (sentence.sentiment) {
    this.addAnnotator(_sentiment2.default)
    this._sentiment = sentence.sentiment
    this._sentimentTree = sentence.sentimentTree
  }
  return this
}

//Add sentence.sentiment function
_sentence.default.prototype.sentiment = function() {
  if(!this.hasAnnotator(_sentiment2.default)) {
    throw new Error('Asked for a sentimentTree on Sentence, but there are unmet annotator dependencies.')
  }
  return this._sentiment
}

//Add sentence.sentimentTree function
_sentence.default.prototype.sentimentTree = function() {
  if(!this.hasAnnotator(_sentiment2.default)) {
    throw new Error('Asked for a sentimentTree on Sentence, but there are unmet annotator dependencies.')
  }
  return this._sentimentTree
}

//Export _corenlp consts, but use new pipeline
const Properties = exports.Properties = _corenlp.Properties
const Pipeline = exports.Pipeline = _pipeline.default
const Service = exports.Service = _corenlp.Service
const ConnectorCli = exports.ConnectorCli = _corenlp.ConnectorCli
const ConnectorServer = exports.ConnectorServer = _corenlp.ConnectorServer

//Export changes as default
exports.default = _corenlp.default