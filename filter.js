M.wrap('github/jillix/bind-filter/dev/filter.js', function (require, module, exports) {
var Events = require('github/jillix/events');
var find = require('./find');
var ui = require('./ui');
var validate = require('./validate');
var templateCache = {};
var defaultOptions = {
    limit: 33
};
var operatorConfig = {
    '=':        ['',        'mixed'],               // or
    '!=':       ['$ne',     'mixed'],               // and
    '>':        ['$gt',     'number'],              // and
    '<':        ['$lt',     'number'],              // and
    '>=':       ['$gte',    'number'],              // and
    '<=':       ['$lte',    'number'],              // and
    'all':      ['$all',    'array',    'split'],   // or ('and' can be achieved by concatenating the arrays)
    'in':       ['$in',     'mixed',    'split'],   // and ('or' can be achieved by concatenating the arrays)
    'notin':    ['$nin',    'mixed',    'split'],   // or ('and' can be achieved by concatenating the arrays)
    'regExp':   ['$regex',  'string'],              // and ('or' is built in the regex syntax)
    'exists':   ['$exists', 'mixed',    'boolean']  // makes no sense
};

function uid (len, uid) {
    uid = "";
    for (var i = 0, l = len || 24; i < l; ++i) {
        uid += "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"[0 | Math.random() * 62];
    }
    return uid;
};

function setFilters (filters, reset) {
    var self = this;
    
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
                self.filters[hash][key] = filters[i][key];
            }
        }
    }
    
    // emit filters cahed event
    self.emit('filtersCached', self.filters, reset);
    
    // find data in db
    find.call(self);
}

function getTemplates (templates, reset, callback) {
    var self = this;

    // get templates to fetch from server
    var resultTemplates = {};
    var templatesToFetch = [];
    for (var i = 0, l = templates.length; i < l; ++i) {
        if (self.templates[templates[i]]) {
            resultTemplates[templates[i]] = self.templates[templates[i]];
        } else {
            templatesToFetch.push(templates[i]);
        }
    }
    
    if (templates.length === 0 || templatesToFetch.length > 0) {
        self.emit('getTemplates', templates, function (err, templates) {
            self.emit('templateResult', err, templates);
            
            if (err) {
                return callback(err);
            }
            
            // merge fetched templates into result templates
            for (var template in templates) {
               self.templates[template] = resultTemplates[template] = templates[template];
            }
            
            // reset cache
            if (reset) {
                self.templates = resultTemplates;
            }
            
            callback(null);
        });
    } else {
        // reset cache
        if (reset) {
            self.templates = resultTemplates;
        }
        callback(null);
    }
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
            self.emit('templates', self.templates);
        });
    }
}

function setTemplate (template, callback) {
    var self = this;

    // TODO this is a hack until bind know how select keys in parameters
    if (typeof template === 'object') {
        template = template.id;
    }

    if (typeof template !== 'string' || !template) {
        return;
    }

    // get template from server or cache
    getTemplates.call(self, [template], false, function (err) {
        
        if (err) {
            // TODO handle error
            return console.error(err);
        }
        
        // set current template
        self.template = template;
        
        // reset predefined filters
        setFilters.call(self, self.config.setFilters || [], true);
        
        // emit the template
        self.emit('template', self.templates[template]);
    });
}

function setOptions (options, reset) {
    var self = this;

    if (typeof options !== 'object') {
        return;
    }

    // reset options
    if (reset) {
        self.options = options;
    // merge options
    } else {
        for (var option in options) {
            self.options[option] = value
        }
    }
}

function getFilters (callback) {
    var self = this;
    var filters = [];
    for (var id in self.filters) {
        var filter = self.filters[id];
        filter.item = null;
        filters.push(filter);
    }
    callback(filters);
}

function initInterface () {
    var self = this;
    
    // listen to interface events
    self.on('setFilters', setFilters);
    self.on('setTemplate', setTemplate);
    self.on('setTemplates', setTemplates);
    self.on('setOptions', setOptions);
    self.on('getFilters', getFilters);
}

function init (config) {

    var self = this;
    
    // prepare module
    self.config = config;
    self.filters = {};
    self.templates = templateCache;
    self.options = defaultOptions;
    self.config.operators = operatorConfig;
    
    if (!config.crud) {
        return console.error('No crud miid defined.');
    }

    // wait for the crud module
    self.onready(config.crud, function () {
        
        // setup interface
        initInterface.call(self);
        
        // listen to external events
        Events.call(self, config);
    
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
    });
}

module.exports = init;


return module; });
