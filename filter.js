M.wrap('github/jillix/bind-filter/dev/filter.js', function (require, module, exports) {
var Events = require('github/jillix/events');
var find = require('./find');
var ui = require('./ui');
var templateCache = {};
var defaultOptions = {
    limit: 33
};
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
        if (self.domRefs.list) {
            self.domRefs.list.innerHTML = '';
        }
    }
    for (var i = 0, l = filters.length; i < l; ++i) {

        // validate field
        if (inputs.validate.call(self, filters[i])) {

            // convert value from value field
            filters[i] = inputs.convert.call(self, filters[i]);

            var hash = filters[i].hash || uid(4);
            self.filters[hash] = self.filters[hash] || {};

            // merge filter
            for (var key in filters[i]) {
                self.filters[hash][key] = filters[i][key];
            }

            list.save.call(self, hash);
        }
    }
    
    self.domRefs.filter.style.display = 'none';

    find.call(self);
}

// TODO callback buffering
// TODO implement loaders and prevent redundant requests
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

    if (templatesToFetch.length > 0) {
        self.emit('getTemplates', templates, function (err, templates) {
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
            if (self.domRefs.templateSelector) {

                var df = document.createDocumentFragment();

                for (var template in self.templates) {
                    df.appendChild(createTemplateSelectOption(template));
                }

                self.domRefs.templateSelector.innerHTML = '';
                self.domRefs.templateSelector.appendChild(df);
            }

            if (callback) {
                callback();
            }
        });
    }
}

function changeTemplate (template, callback) {
    var self = this;

    // TODO this is a hack until bind know how select keys in parameters
    if (typeof template === 'object') {
        template = template._id;
    }

    if (typeof template !== 'string' || !template) {
        return;
    }

    // get template from server or cache
    getTemplates.call(self, [template], false, function (err) {

        if (err || !self.templates[template]) {
            return console.error('Template error: ' + template);
        }

        self.template = template;

        // set fields
        inputs.fields.call(self);

        // select a field
        changeField.call(self);

        // reset predefined filters
        setFilters.call(self, self.config.setFilters || [], true);

        // add template to templateSelector
        if (!self.templates[template]) {
            self.templates[template] = template;

            if (self.domRefs.templateSelector) {
                self.domRefs.templateSelector.appendChild(createTemplateSelectOption(template));
            }
        }

        // select template
        if (self.domRefs.templateSelector) {
            self.domRefs.templateSelector.value = template;
        }

        if (callback) {
            callback();
        }
        
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
        filters.push(self.filters[id]);
    }
    callback(filters);
}

function initInterface () {
    var self = this;
    
    // listen to interface events
    self.on('setFilters', setFilters);
    self.on('setTemplate', changeTemplate);
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
        
        // init templates
        // TODO this is a hack until callback buffering is implemented
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
        
        // setup interface
        initInterface.call(self);
        
        // listen to external events
        Events.call(self, config);
    
        if (self.config.ui) {
            ui.call(self);
        }
        
        self.emit('ready');
    });
}

module.exports = init;

return module; });
