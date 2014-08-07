var Bind = require('github/jillix/bind');
var Events = require('github/jillix/events');

var find = require('./find');
var ui = require('./ui');
var validate = require('./validate');

var firstTemplate = true;
var templateCache = {};
var defaultOptions = {
    limit: 17
};
var operatorConfig = {
    '=':        ['',        'mixed'],                                               // or
    '!=':       ['$ne',     ['number', 'date', 'string', 'array']],                 // and
    '>':        ['$gt',     ['number', 'date']],                                    // and
    '<':        ['$lt',     ['number', 'date']],                                    // and
    '>=':       ['$gte',    ['number', 'date']],                                    // and
    '<=':       ['$lte',    ['number', 'date']],                                    // and
    'in':       ['$in',     ['number', 'string', 'array'],              'split'],   // and ('or' can be achieved by concatenating the arrays)
    'notin':    ['$nin',    ['number', 'string', 'array'],              'split'],   // or ('and' can be achieved by concatenating the arrays)
    'all':      ['$all',    ['array'],    'split'],                                 // or ('and' can be achieved by concatenating the arrays)
    'regExp':   ['$regex',  ['string']],                                            // and ('or' is built in the regex syntax)
    'exists':   ['$exists', 'mixed',                                    'boolean']  // makes no sense
};

function MergeRecursive(obj1, obj2) {

    for (var p in obj2) {
        if (!obj2.hasOwnProperty(p)) continue;
        try {
            // Property in destination object set; update its value.
            if (obj2[p].constructor == Object) {
                obj1[p] = MergeRecursive(obj1[p], obj2[p]);
            } else {
                obj1[p] = obj2[p];
            }
        } catch(e) {
            // Property in destination object not set; create it and set its value.
            obj1[p] = obj2[p];
        }
    }

    return obj1;
}
function findValue (parent, dotNot) {

    if (!dotNot) return undefined;

    var splits = dotNot.split('.');
    var value;

    for (var i = 0; i < splits.length; i++) {
        value = parent[splits[i]];
        if (value === undefined) return undefined;
        if (typeof value === 'object') parent = value;
    }

    return value;
}

function findFunction (parent, dotNot) {

    var func = findValue(parent, dotNot);

    if (typeof func !== 'function') {
        return undefined;
    }

    return func;
}

function uid (len, uid) {
    uid = '';
    for (var i = 0, l = len || 24; i < l; ++i) {
        uid += '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'[0 | Math.random() * 62];
    }
    return uid;
};

function setFilters (filters, reset, dontFetchData, callback) {
    var self = this;

    // callback must be a function
    callback = callback || function () {};

    if (!filters || typeof filters !== 'object' || !self.template) {
        var err = 'setFilters: no template set!';
        callback (err);
        return console.error(err);
    }

    // we always reset the skip option
    self.emit('resetSkip');

    // reset filters if reset is true
    if (reset) {
        self.filters = {};
    }

    // create and buffer filters
    for (var i = 0, l = filters.length; i < l; ++i) {

        // check if cutom filter
        if (typeof filters[i] === 'string' && self.config.customFilterHandlers) {

            // get the function
            var filterFunction = findFunction(window, self.config.customFilterHandlers + "." + filters[i]);

            // check if the function exists
            if (!filterFunction) { continue; }

            var filter = filterFunction.call(self);
            if (filter && typeof filter === 'object') {
                filters[i] = filter;
            } else {
                continue;
            }
        } else if (typeof filters[i] === 'string' && !self.config.customFilterHandlers) {
            continue;
        }

        // validate field
        if (validate.validate.call(self, filters[i])) {

            // convert value from value field
            filters[i] = validate.convert.call(self, filters[i]);

            var hash = filters[i].hash || uid(4);
            self.filters[hash] = self.filters[hash] || {};

            // merge filter
            for (var key in filters[i]) {
                if (!filters[i].hasOwnProperty(key)) continue;
                self.filters[hash][key] = filters[i][key];
            }

            // if field type is string and operator is 'regexp' make it case insensitive
            var field = self.templates[self.template].schema[filters[i].field];
            if (filters[i].operator === 'regExp' && field && field.type === 'string' && !field.casesensitive) {
                self.filters[hash].originalValue = filters[i].value;
                self.filters[hash].value = '(?i)' + filters[i].value;
            } else {
                delete self.filters[hash].originalValue;
            }
        }
    }

    // emit filters cached event
    self.emit('filtersCached', self.filters, reset);

    // find data in db
    if (!dontFetchData) {
        find.call(self, undefined, callback);
    }
}

function getTemplates (templates, reset, callback) {
    var self = this;

    // fetch templates from server
    self.emit('find', templates, function (err, result) {

        self.emit('templateResult', err, result);

        if (err || !result) {
            return callback(err || new Error('No templates found.'));
        }

        // reset cache
        if (reset) {
            self.templates = {};
        }

        // merge fetched templates into result templates
        for (var i = 0, l = result.length; i < l; ++i) {
            self.templates[result[i]._id] = result[i];

            // select a template
            if (result[i]._id === templates[0]) {
                self.template = templates[0];
            }
        }

        callback(null);
    });
}

function setTemplates (templates, callback) {
    var self = this;

    if (templates instanceof Array) {
        getTemplates.call(self, templates, true, function (err) {
            if (err) {
                // TODO handle error
                return console.error(err);
            }

            if (callback) {
                callback();
            }

            // emit the templates
            self.emit('template', self.templates[self.template]);
            self.emit('templates', self.templates);
        });
    }
}

// TODO swap force and dontFetchData parameter to have the same syntax everywhere
function setTemplate (template, dontFetchData, force, callback) {
    var self = this;

    if (typeof force === 'function') {
        callback = force;
        force = undefined;
    }

    if (typeof dontFetchData === 'function') {
        callback = dontFetchData;
        dontFetchData = undefined;
    }

    // callback must be a function
    callback = callback || function () {};

    // TODO this is a hack until bind knows how select keys in parameters
    var template = typeof template === 'string' ? template : template._id;
    if (!template) {
        var err = 'Wrong template format: ' + typeof template;
        callback (err);
        return console.error(err);
    }

    // nothing to do if the same template
    if (!force && self.template === template) {
        callback();
        return;
    }

    // get template from server or cache
    getTemplates.call(self, [template], false, function (err) {

        if (err || !self.templates[template]) {
            err = err || 'template ' + template + ' not found.';
            callback (err);
            return console.error(err);
        }

        // set sort options
        if ((self.templates[template].options || {}).sort) {
            self.emit('setOptions', { sort: self.templates[template].options.sort });
        }

        setFilters.call(self, (self.config.setFilters || []).concat((self.templates[template].options || {}).filters || []), true, dontFetchData, callback);

        // emit the template
        self.emit('template', self.templates[template]);
    });
}

function resetSkip () {
    var self = this;

    self.options = self.options || {};
    self.options.skip = 0;
}

function setOptions (options, reset, callFind, callback) {
    var self = this;

    if (typeof options !== 'object') {
        return;
    }

    // when no skip is received, we force it to 0
    //options.skip = options.skip || 0;

    // reset options
    if (reset) {
        self.options = options;
    }
    // merge options
    else {
        for (var option in options) {
            if (!options.hasOwnProperty(option)) continue;
            var value = options[option];
            self.options[option] = value;
        }
    }

    // emit options cahed event
    self.emit('optionsCached', self.options, reset);

    // find data in db
    if (callFind) {
        find.call(self, undefined, callback);
    }
}

function getFilters (callback) {

    // set self (the module)
    var self = this;

    // filters to send
    var filters = [];

    // each filter from self.filters
    for (var id in self.filters) {

        if (!self.filters.hasOwnProperty(id)) continue;

        // current filter
        var cFilter = self.filters[id];

        // build filter to push
        var filter = {};

        // set only these fields
        var fieldsToSend = ['originalValue', 'field', 'operator', 'value', 'hidden', 'fixed', 'label'];

        for (var i = 0; i < fieldsToSend.length; ++i) {

            // get the current field
            var cField = fieldsToSend[i];

            // if is NOT a key from cFilter go to the next one
            if (!cFilter.hasOwnProperty(cField)) continue;

            // set the field in filter
            filter[cField] = cFilter[cField];
        }

        // push the filter in filters
        filters.push(filter);
    }

    // and callback the filters
    callback(filters);
}

function getItem (dataItem, callback) {
    var self = this;

    if (!self.query || !dataItem._id) { return; }

    if (self.crudFindBusy) {
        return callback('Find is busy.');
    }

    self.crudFindBusy = true;

    var query = {
        q: {_id: dataItem._id},
        o: {limit: 1},
        t: self.query.t
    };

    self.emit('find', query, function (err, data) {
        self.crudFindBusy = false;

        if  (data && data[0]) {
            data[0].bindFilterMessage = 'show';
            return callback(null, data[0]);
        }

        // TODO How must this look?
        callback(null, {_id: dataItem._id, bindFilterMessage: 'hide'});
    });
}

function initInterface () {
    var self = this;

    // listen to interface events
    self.on('setFilters', setFilters);
    self.on('setTemplate', setTemplate);
    self.on('setTemplates', setTemplates);
    self.on('setOptions', setOptions);
    self.on('getFilters', getFilters);
    self.on('getItem', getItem);
    self.on('refresh', find);
    self.on('resetSkip', resetSkip);
}

function init (config) {

    var self = this;
    // prepare module
    self.config = config;
    self.filters = {};
    self.templates = templateCache;

    // TODO merge options
    self.options = config.options || defaultOptions;
    self.config.operators = operatorConfig;

    if (!config.waitFor) {
        return console.error('At least a CRUD mofule must be a dependency of the bind-filter module.');
    }

    // setup interface
    initInterface.call(self);

    // listen to external events
    Events.call(self, config);

    // run the binds
    for (var i in config.binds) {
        if (!config.binds.hasOwnProperty(i)) continue;

        Bind.call(self, config.binds[i]);
    }

    // i18n for operators
    if (self.config.i18n === true) {

        // cache for translated operators
        self.config.i18n = {};

        var operators = self.config.operators;
        for (var operator in operators) {
            if (!operators.hasOwnProperty(operator)) continue;

            (function (op) {
                self.emit('message', op, function (err, newOperator) {
                    if (err) { return; }
                    // cache the translated operator
                    self.config.i18n[op] = newOperator.message;
                });
            })(operator);
        }

        // translate 'true' and 'false'
        var values = ['true', 'false'];
        for (var i = 0; i < values.length; ++i) {
            (function (val) {
                self.emit('message', val, function (err, result) {
                    if (err) { return; }
                    self.config.i18n[val] = result.message;
                });
            })(values[i]);
        }
    }

    if (self.config.ui) {
        ui.call(self);
    }

    // init templates
    if (self.config.setTemplates) {
        self.emit('setTemplates', self.config.setTemplates, function () {
            // init template
            if (self.config.template) {
                self.emit('setTemplate', self.config.template);
            }
        });
    // init template
    } else if (self.config.template) {
        self.emit('setTemplate', self.config.template);
    }

    self.emit('ready');
}

module.exports = init;
