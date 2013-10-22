M.wrap('github/jillix/bind-filter/dev/filter.js', function (require, module, exports) {
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
    '=':        ['',        'mixed'],                                       // or
    '!=':       ['$ne',     ['number', 'string', 'array']],                 // and
    '>':        ['$gt',     ['number']],                                    // and
    '<':        ['$lt',     ['number']],                                    // and
    '>=':       ['$gte',    ['number']],                                    // and
    '<=':       ['$lte',    ['number']],                                    // and
    'in':       ['$in',     ['number', 'string', 'array'],    'split'],     // and ('or' can be achieved by concatenating the arrays)
    'notin':    ['$nin',    ['number', 'string', 'array'],    'split'],     // or ('and' can be achieved by concatenating the arrays)
    'all':      ['$all',    ['array'],    'split'],                         // or ('and' can be achieved by concatenating the arrays)
    'regExp':   ['$regex',  ['string']],                                    // and ('or' is built in the regex syntax)
    'exists':   ['$exists', 'mixed',    'boolean']                          // makes no sense
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

function uid (len, uid) {
    uid = "";
    for (var i = 0, l = len || 24; i < l; ++i) {
        uid += "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"[0 | Math.random() * 62];
    }
    return uid;
};

function setFilters (filters, reset, dontFetchData) {
    var self = this;
    
    if (!filters || typeof filters !== "object" || !self.template) {
        return console.error('setFilters: no template set!');;
    }

    // we always reset the skip option
    self.emit('resetSkip');

    // reset filters if reset is true
    if (reset) {
        self.filters = {};
    }
    
    // create and buffer filters
    for (var i = 0, l = filters.length; i < l; ++i) {
    
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
        find.call(self);
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
function setTemplate (template, dontFetchData, force) {
    var self = this;

    // TODO this is a hack until bind knows how select keys in parameters
    var template = typeof template === 'string' ? template : template._id;
    if (!template) {
        // TODO handle error
        return console.error('Wrong template format: ' + typeof template);
    }

    // nothing to do if the same template
    if (!force && self.template === template) {
        return;
    }

    // get template from server or cache
    getTemplates.call(self, [template], false, function (err) {
        
        if (err || !self.templates[template]) {
            // TODO handle error
            return console.error(err || 'template ' + template + ' not found.');
        }
        
        // set sort options
        if ((self.templates[template].options || {}).sort) {
            self.emit("setOptions", { sort: self.templates[template].options.sort });
        }

        setFilters.call(self, (self.config.setFilters || []).concat((self.templates[template].options || {}).filters || []), true, dontFetchData);

        // emit the template
        self.emit('template', self.templates[template]);
    });
}

function resetSkip () {
    var self = this;

    self.options = self.options || {};
    self.options.skip = 0;
}

function setOptions (options, reset, callFind) {
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
            
            // option is an array
            //var optionValue = self.options[option];

            // TODO How do we merge objects?
            // switch ((optionValue || {}).constructor) {
            //     case Array:
            //         optionValue.push(value);
            //         break;
            //     case Object:
            //         switch (value.constructor) {
            //             case Object:
            //                 optionValue = MergeRecursive(self.options[option], value);
            //                 break;
            //             default:
            //                 optionValue = value;
            //                 break;
            //         }
            //         break;
            //     default:
            //         optionValue = value;
            // }

            self.options[option] = value;
        }
    }

    // emit options cahed event
    self.emit('optionsCached', self.options, reset);
    
    // find data in db
    if (callFind) {
        find.call(self);
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
        var fieldsToSend = ["field", "label", "operator", "originalValue", "value"];

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

    if (!self.query) { return; }

    if (self.crudFindBusy) {
        return callback('Find is busy.');
    }

    self.crudFindBusy = true;

    var queryWithoutLimit = JSON.parse(JSON.stringify(self.query));
    delete queryWithoutLimit.o.limit;

    self.emit('find', queryWithoutLimit, function (err, data) {
        self.crudFindBusy = false;

        for (var i = 0, l = data.length; i < l; ++i) {
            if (data[i]._id === dataItem._id) {
                data[i].bindFilterMessage = 'show';
                return callback(null, data[i]);
            }
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
                self.emit("message", op, function (err, newOperator) {
                    if (err) { return; }
                    // cache the translated operator
                    self.config.i18n[op] = newOperator.message;
                });
            })(operator);
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

return module; });
