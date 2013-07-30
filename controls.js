M.wrap('github/jillix/bind-filter/dev/controls.js', function (require, module, exports) {
var list = require('./list');
var find = require('./find');
var inputs = require('./inputs');

// TODO handle dom with bind
function elm(d,a){try{var b=document.createElement(d);if("object"===typeof a)for(var c in a)b.setAttribute(c,a[c]);return b}catch(e){return null}}

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

    find.call(self);
    return true;
}

function save () {
    var self = this;
    var filter = {
        field: self.domRefs.inputs.field.value,
        operator: self.domRefs.inputs.operator.value || '=',
        value: self.domRefs.inputs.value.value,
        hash: self.current
    };

    if (setFilters.call(self, [filter])) {
        self.domRefs.filter.style.display = 'none';
    }
}

function edit (hash) {
    var self = this;
    var values = hash ? self.filters[hash] : {};

    self.current = hash || null;

    // handle remove button
    if (hash && self.filters[hash]) {
        self.domRefs.controls.remove.style.display = 'inline';
    } else {
        self.domRefs.controls.remove.style.display = 'none';
    }

    // change value field and operator selection dependent of selected field
    changeField.call(self, values.field, values.operator, values.value);

    self.domRefs.filter.style.display = 'block';
}

function remove (hash) {
    var self = this;

    self.domRefs.filter.style.display = 'none';
    list.remove.call(self, hash || self.current);

    find.call(self);
}

function cancel () {
    var self = this;
    self.current = null;
    self.domRefs.filter.style.display = 'none';
}

function enable (hash) {
    var self = this;
    // TODO remove class with bind
    self.filters[hash].item.setAttribute('class', '');
    self.filters[hash].disabled = false;

    find.call(self);
}

function disable (hash) {
    var self = this;
    // TODO add class with bind
    self.filters[hash].item.setAttribute('class', 'disabled');
    self.filters[hash].disabled = true;

    find.call(self);
}

function changeField (field, operator, value) {
    var self = this;

    if (!field) {
        for (field in self.templates[self.template]) {
            if (field.indexOf('_') !== 0) {
                break;
            }
        }
    }

    // select field if it exists in the schema
    if (self.domRefs.inputs.field) {
        self.domRefs.inputs.field.value = field;
    }

    // set operators which are compatible with the field template
    // and create value field depending on schema and operator
    inputs.value.call(self, field, operator, value);
}

function createTypeSelectOption (template) {
    var option = elm('option', {value: template});
    option.innerHTML = template;
    return option;
}

// TODO callback buffering
// TODO implement loaders and prevent redundant requests
function getTypes (templates, reset, callback) {
    var self = this;

    // get templates to fetch from server
    var resultTypes = {};
    var templatesToFetch = [];
    for (var i = 0, l = templates.length; i < l; ++i) {
        if (self.templates[templates[i]]) {
            resultTypes[templates[i]] = self.templates[templates[i]];
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
               self.templates[template] = resultTypes[template] = templates[template];
            }

            // reset cache
            if (reset) {
                self.templates = resultTypes;
            }
            callback(null);
        });
    } else {
        // reset cache
        if (reset) {
            self.templates = resultTypes;
        }
        callback(null);
    }
}

function setTypes (templates, callback) {
    var self = this;

    if (templates instanceof Array) {
        getTypes.call(self, templates, true, function (err) {
            if (self.domRefs.templateSelector) {

                var df = document.createDocumentFragment();

                for (var template in self.templates) {
                    df.appendChild(createTypeSelectOption(template));
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

function changeType (template, callback) {
    var self = this;

    // TODO this is a hack until bind know how select keys in parameters
    if (typeof template === 'object') {
        template = template._id;
    }

    if (typeof template !== 'string' || !template) {
        return;
    }

    // get template from server or cache
    getTypes.call(self, [template], false, function (err) {

        if (err || !self.templates[template]) {
            return console.error('Type error: ' + template);
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
                self.domRefs.templateSelector.appendChild(createTypeSelectOption(template));
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
    callback(self.filters);
}

function handleFindResult (err, data) {
    //console.log(err || data.length + " items found.");
}

function init () {
    var self = this;

    // listen to internal events
    self.on('saveFilter', save);
    self.on('createFilter', edit);
    self.on('editFilter', edit);
    self.on('enableFilter', enable);
    self.on('disableFilter', disable);
    self.on('removeFilter', remove);
    self.on('cancelFilter', cancel);
    self.on('fieldChange', changeField);

    // listen to interface events
    self.on('result', handleFindResult);
    self.on('setFilters', setFilters);
    self.on('setType', changeType);
    self.on('setTypes', setTypes);
    self.on('setOptions', setOptions);
    self.on('getFilters', getFilters);

    // add events to controls
    for (var handler in self.domRefs.controls) {

        var control = self.domRefs.controls[handler];
        if (control) {
            control.addEventListener(self.config.events[handler] || 'click', (function (handler) {
                return function () {
                    self.emit(handler + 'Filter');
                }
            })(handler));
        }
    }

    // template change
    if (self.domRefs.templateSelector) {
        self.domRefs.templateSelector.addEventListener('change', function () {
            self.emit('setType', self.domRefs.templateSelector.value);
        });
    }

    // field change
    if (self.domRefs.inputs.field) {
        self.domRefs.inputs.field.addEventListener('change', function () {
            self.emit('fieldChange', self.domRefs.inputs.field.value);
        });
    }

    // operator change
    if (self.domRefs.inputs.operator) {
        self.domRefs.inputs.operator.addEventListener('change', function () {
            self.emit('fieldChange', self.domRefs.inputs.field.value, self.domRefs.inputs.operator.value);
        });
    }

    // init templates
    // TODO this is a hack until callback buffering is implemented
    if (self.config.setTypes) {
        self.emit('setTypes', self.config.setTypes, function () {
            // init template
            if (self.config.template) {
                self.emit('setType', self.config.template);
            }
        });
    // init template
    } else if (self.config.template) {
        self.emit('setType', self.config.template);
    }
}

exports.init = init;

return module; });
