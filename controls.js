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
        self.domRefs.list.innerHTML = '';
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
        for (field in self.types[self.type]) {
            break;
        }
    }
    
    // select field if it exists in the schema
    self.domRefs.inputs.field.value = field;
    
    // set operators which are compatible with the field type
    // and create value field depending on schema and operator
    inputs.value.call(self, field, operator, value);
}

function createTypeSelectOption (type) {
    var option = elm('option', {value: type});
    option.innerHTML = type;
    return option;
}

// TODO callback buffering
// TODO implement loaders and prevent redundant requests
function getTypes (types, reset, callback) {
    var self = this;
    
    // get types to fetch from server
    var resultTypes = {};
    var typesToFetch = [];
    for (var i = 0, l = types.length; i < l; ++i) {
        if (self.types[types[i]]) {
            resultTypes[types[i]] = self.types[types[i]];
        } else {
            typesToFetch.push(types[i]);
        }
    }
    
    if (typesToFetch.length > 0) {
        self.emit('getTemplates', types, function (err, types) {
            if (err) {
                return callback(err);
            }
            
            // merge fetched types into result types
            for (var type in types) {
               self.types[type] = resultTypes[type] = types[type];
            }
            
            // reset cache
            if (reset) {
                self.types = resultTypes;
            }
            callback(null);
        });
    } else {
        // reset cache
        if (reset) {
            self.types = resultTypes;
        }
        callback(null);
    }
}

function setTypes (types, callback) {
    var self = this;
    
    if (types instanceof Array) {
        getTypes.call(self, types, true, function (err) {
            if (self.domRefs.typeSelector) {
            
                var df = document.createDocumentFragment();
                
                for (var type in self.types) {
                    df.appendChild(createTypeSelectOption(type));
                }
                
                self.domRefs.typeSelector.innerHTML = '';
                self.domRefs.typeSelector.appendChild(df);
            }
            
            if (callback) {
                callback();
            }
        });
    }
}

function changeType (type, callback) {
    var self = this;
    
    // TODO this is a hack until bind know how select keys in parameters
    if (typeof type === 'object') {
        type = type._id;
    }
    
    if (typeof type !== 'string' || !type) {
        return;
    }
    
    // get type from server or cache
    getTypes.call(self, [type], false, function (err) {
        
        if (err || !self.types[type]) {
            return console.error('Type error: ' + type);
        }
        
        self.type = type;
        
        // set fields
        inputs.fields.call(self);
        
        // select a field
        changeField.call(self);
        
        // reset predefined filters
        setFilters.call(self, self.config.setFilters || [], true);
        
        // add type to typeSelector
        if (!self.types[type]) {
            self.types[type] = type;
            
            if (self.domRefs.typeSelector) {
                self.domRefs.typeSelector.appendChild(createTypeSelectOption(type));
            }
        }
        
        // select type
        if (self.domRefs.typeSelector) {
            self.domRefs.typeSelector.value = type;
        }
        
        if (callback) {
            callback();
        }
    });
}

function handleFindResult (err, data) {
    console.log(err || data.length + " items found.");
}

function init () {
    var self = this;
    
    // listen
    self.on('result', handleFindResult);
    self.on('setFilters', setFilters);
    self.on('saveFilter', save);
    self.on('createFilter', edit);
    self.on('editFilter', edit);
    self.on('enableFilter', enable);
    self.on('disableFilter', disable);
    self.on('removeFilter', remove);
    self.on('cancelFilter', cancel);
    self.on('fieldChange', changeField);
    self.on('setType', changeType);
    self.on('setTypes', setTypes);
    
    // add events to controls
    for (var handler in self.domRefs.controls) {
        self.domRefs.controls[handler].addEventListener(self.config.events[handler] || 'click', (function (handler) {
            return function () {
                self.emit(handler + 'Filter');
            }
        })(handler));
    }
    
    // type change
    if (self.domRefs.typeSelector) {
        self.domRefs.typeSelector.addEventListener('change', function () {
            self.emit('setType', self.domRefs.typeSelector.value);
        });
    }
    
    // field change
    self.domRefs.inputs.field.addEventListener('change', function () {
        self.emit('fieldChange', self.domRefs.inputs.field.value);
    });
    
    // operator change
    self.domRefs.inputs.operator.addEventListener('change', function () {
        self.emit('fieldChange', self.domRefs.inputs.field.value, self.domRefs.inputs.operator.value);
    });
    
    // init types
    // TODO this is a hack until callback buffering is implemented
    if (self.config.setTypes) {
        self.emit('setTypes', self.config.setTypes, function () {
            // init type
            if (self.config.type) {
                self.emit('setType', self.config.type);
            }
        });
    // init type
    } else if (self.config.type) {
        self.emit('setType', self.config.type);
    }
}

exports.init = init;

return module; });
