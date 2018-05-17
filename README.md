# corenlp-sentiment
Extension of npm package corenlp. Modified to include sentiment.

See [original](https://github.com/gerardobort/node-corenlp) for full explanation of usage.

## Usage:
This:
```javascript
var CoreNLP = require('corenlp-sentiment')

const props = new CoreNLP.Properties({ annotators: 'sentiment' })
const pipeline = new CoreNLP.Pipeline(props, 'English')

const doc = new CoreNLP.default.simple.Document("This is a sentence.")

pipeline.annotate(doc)
  .then(doc => {
    console.log(doc.sentence(0).sentimentTree())
    console.log(doc.sentence(0).sentiment())
  })
  .catch(err => {
    console.log('err', err)
  })
```
Gives this:
```
(ROOT|sentiment=2|prob=0.873 (NP|sentiment=2|prob=0.998 This)
  (@S|sentiment=2|prob=0.899
    (VP|sentiment=2|prob=0.982 (VBZ|sentiment=2|prob=0.989 is)
      (NP|sentiment=2|prob=0.993 (DT|sentiment=2|prob=0.990 a) (NN|sentiment=2|prob=0.976 sentence)))
    (.|sentiment=2|prob=0.997 .)))
```
And this:
```
Neutral
```

### Note:
The sentiment tree does not usually match the parse tree structure. It has been bifurcated, in that it has been forced into binary tree format. This is accomplished by adding extra nodes and collapsing some unary nodes.

I have created an [NPM package](https://www.npmjs.com/package/furcatedtreetransformer) to force it back to its original form, but it is not fully complete: collapsed unary nodes will still be missing, and the sentiment data pushed around by the unfurcation is messy.
