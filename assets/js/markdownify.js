var Emoji = require('markdown-it-emoji');
var Abbr = require('markdown-it-abbr');
var Foot = require('markdown-it-footnote');
var Sub = require('markdown-it-sub');
var Sup = require('markdown-it-sup');
var TContents = require('markdown-it-table-of-contents');
var Anch = require('markdown-it-anchor');
var FontAwesome = require('markdown-it-fontawesome');
var Attrs = require('markdown-it-attrs');
var MathIt = require('markdown-it-mathjax');

var MarkdownIt = require('markdown-it')()
    .use(Emoji)
    .use(Abbr)
    .use(Foot)
    .use(Sub)
    .use(Sup)
    .use(TContents, {
        includeLevel: [1,2,3,4,5,6]
    })
    .use(Anch, {
        permalink: true,
        permalinkSymbol: "<i class='fa fa-link' aria-hidden='true'></i>"
    })
    .use(FontAwesome)
    .use(Attrs)
    .use(MathIt);
// var md = new MarkdownIt();
var output; // = md.render("# hi");

process.argv.forEach(function (val, index, array) {
    if(index == 2) {
        output = MarkdownIt.render(val);
    }
});

// output = MarkdownIt.render("$1 *2* 3$");

console.log(output);
