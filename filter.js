M.wrap('github/jillix/bind-filter/dev/filter.js', function (require, module, exports) {
var Events = require('github/jillix/events');
var controls = require('./controls').init;
var operators = require('./operators');
var typeCache = {};
var operatorConfig = {
    '=': ['', 'mixed'], // or
    '!=': ['$ne', 'mixed'],// or
    '>': ['$gt', 'number'], // no
    '<': ['$lt', 'number'], // no
    '>=': ['$gte', 'number'], // no
    '<=': ['$lte', 'number'], // no
    'all': ['$all', 'array'], // or
    'in': ['$in', 'array'], // and
    'notin': ['$nin', 'array'], // or
    'regExp': ['$regex', 'string'], // and
    'exists': ['$exists', 'mixed', 'boolean'] // no
};
var defaultOptions = {
    limit: 33
};

// TODO use bind for dom interaction/manipulation
function get(s,c){
    try{return (c||document).querySelector(s);}
    catch (err) {
        return null;
    }
}

function initDom () {
    var self = this;

    if (!self.config.controls) {
        return console.error('No controls found.');
    }

    // get dom refs
    self.domRefs = {};
    self.domRefs.filter = get(self.config.filter, self.dom);
    self.domRefs.valueLabel = get(self.config.valueLabel, self.dom);
    self.domRefs.valueField = get(self.config.valueField, self.dom);

    if (self.config.typeSelector) {
        self.domRefs.typeSelector= get(self.config.typeSelector, self.dom);
    }

    // list item
    self.domRefs.list = get(self.config.list, self.dom);
    self.domRefs.listItem = get(self.config.listItem, self.domRefs.list);

    if (self.domRefs.list) {
        self.domRefs.list.innerHTML = '';
    }

    self.domRefs.inputs = {};
    for (var name in self.config.inputs) {
        self.domRefs.inputs[name] = get(self.config.inputs[name], self.dom);
    }

    self.domRefs.controls = {};
    for (var name in self.config.controls) {
        self.domRefs.controls[name] = get(self.config.controls[name], self.dom);
    }

    controls.call(self);
}

function init (config) {

    var self = this;
    self.config = config;
    self.filters = {};
    self.types = typeCache;
    self.options = defaultOptions;
    self.config.operators = operatorConfig;

    // listen to external events
    Events.call(self, config);

    if (!config.crud) {
        return console.error('No crud miid defined.');
    }

    // wait for the crud module
    self.onready(config.crud, function () {
        initDom.call(self);
        self.emit('ready');
    });
}

module.exports = init;

return module; });
