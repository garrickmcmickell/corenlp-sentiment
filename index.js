const _corenlp = require('corenlp')

var _pipeline = require('corenlp/dist/pipeline')

var _sentence = require('corenlp/dist/simple/sentence')

var _sentiment = require('./sentiment')

var _sentiment2 = _interopRequireDefault(_sentiment)

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_corenlp.default.simple.annotator['SentimentAnnotator'] = _sentiment2.default

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
};

_pipeline.default.prototype._getAnnotators = function() {
  return this._getAnnotatorsKeys().map(annotatorKey => ANNOTATORS_BY_KEY[annotatorKey])
}

_pipeline.default.prototype._getAnnotatrosOptions = function() {
  const pipelineProps = this._properties.getProperties();
  const validPrfixes = Object.keys(ANNOTATORS_BY_KEY);
  return Object.keys(pipelineProps).filter(propName => validPrfixes.indexOf(propName) === 0).reduce((acc, val, key) => _extends({}, acc, { [key]: val }), {});
}

_sentence.default.prototype.fromJSON = function(data, isSentence = false) {
  const sentence = isSentence ? data : (0, _lodash2.default)(data.sentences);
  this._index = data.index;
  if (sentence.tokens) {
    this.addAnnotator(_corenlp.default.simple.annotator.TokenizerAnnotator.default);
    this._tokens = sentence.tokens.map(tok => _corenlp.default.simple.annotator.TokenizerAnnotator.default.fromJSON(tok));
  }
  if (sentence.parse) {
    this.addAnnotator(_parse2.default);
    this._parse = sentence.parse;
  }
  if (sentence.basicDependencies) {
    this.addAnnotator(_depparse2.default);
    this._governors = sentence.basicDependencies.map(gov => new _governor2.default(gov.dep, this._tokens[gov.dependent - 1], this._tokens[gov.governor - 1]));
    // @see relation annotator...
    this._basicDependencies = sentence.basicDependencies;
    this._enhancedDependencies = sentence.enhancedDependencies;
    this._enhancedPlusPlusDependencies = sentence.enhancedPlusPlusDependencies;
  }
  if (sentence.sentiment){
    this.addAnnotator(_sentiment2.default);
    this._sentiment = sentence.sentiment;
    this._sentimentTree = sentence.sentimentTree;
    }
}

/*_sentence.default.prototype.sentimentTree = function() {
  if(!this.hasAnnotator(_sentiment2.default)) {
    throw new Error('Asked for a sentimentTree on Sentence, but there are unmet annotator dependencies.');
  }
  return this._sentimentTree;
}*/

const props = new _corenlp.Properties({ annotators: 'tokenize,ssplit' }) //,pos,sentiment
const pipeline = new _corenlp.Pipeline(props, 'English')

const doc = new _corenlp.default.simple.Document("This is a test")

pipeline.annotate(doc)
  .then(doc => {
    console.log(doc.sentence(0).sentimentTree)
  })
  .catch(err => {
    console.log('err', err)
  })