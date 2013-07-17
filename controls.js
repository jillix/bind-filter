M.wrap('github/jillix/bind-filter/dev/controls.js', function (require, module, exports) {
var list = require('./list');
var find = require('./find');
var operators = require('./operators');

// TODO handle dom with bind
function elm(d,a){try{var b=document.createElement(d);if("object"===typeof a)for(var c in a)b.setAttribute(c,a[c]);return b}catch(e){return null}}

function uid (len, uid) {
    uid = "";
    for (var i = 0, l = len || 24; i < l; ++i) {
        uid += "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"[0 | Math.random() * 62];
    }
    return uid;
};


function getValues () {
    var self = this;
    
    return {
        field: self.domRefs.inputs.field.value,
        operator: self.domRefs.inputs.operator.value || '=',
        value: self.domRefs.inputs.value.value
    };
}

function resetValues (values) {
    var self = this;
    
    if (values.field) {
        self.domRefs.inputs.field.value = values.field;
        self.domRefs.inputs.operator.value = values.operator;
        
        if (self.domRefs.inputs.value) {
            self.domRefs.inputs.value.value = values.value;
        }
    } else {
        self.domRefs.inputs.field.options[0].selected = true;
        self.domRefs.inputs.operator.options[0].selected = true;
        
        if (self.domRefs.inputs.value) {
            self.domRefs.inputs.value.value = '';
        }
    }
}

function handleFindResult (err, data) {
    //console.log(err || data);
}

function checkField (field) {
    var self = this;
    
    for (var i = 0, l = self.config.fields.length; i < l; ++i) {
        if (field === self.config.fields[i]) {
            return true;
        }
    }
    return false;
}

function setFilters (filters, reset) {
    var self = this;
    
    // reset filters if reset is true
    if (reset) {
        self.filters = {};
        self.domRefs.list.innerHTML = '';
    }
    
    // TODO implement hidden and fixed filters
    for (var i = 0, l = filters.length; i < l; ++i) {
        
        // skip fields that don't exists in schema
        if (!checkField.call(self, filters[i].field)) {
            continue;
        }
        
        var hash = uid(4);
        
        self.filters[hash] = {
            values: filters[i],
            // TODO enable/disable individual filters
            enabled: self.config.enabled ? true : false
        };
        
        list.save.call(self, hash);
    }
    
    find.call(self);
}

function save () {
    var self = this;
    var values = getValues.call(self);
    
    // validate value
    if (!operators.validateValue.call(self, values)) {
        return;
    }
    
    self.domRefs.filter.style.display = 'none';
    
    // get or create filter hash
    var hash = self.current || uid(4);
    
    self.filters[hash] = self.filters[hash] || {};
    self.filters[hash].values = values;
    self.filters[hash].enabled = true;
    
    // add list item
    list.save.call(self, hash);
    
    // call server
    find.call(self);
}

function edit (hash) {
    var self = this;
    var values = hash ? self.filters[hash].values : {};
    self.current = hash || null;
    
    // handle remove button
    if (hash && self.filters[hash]) {
        self.domRefs.controls.remove.style.display = 'inline';
    } else {
        self.domRefs.controls.remove.style.display = 'none';
    }
    
    // operator init
    resetValues.call(self, values);
    
    // change value field dependent of selected operator
    value.call(self, self.domRefs.inputs.operator.value, values.value || '');
    
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
    self.filters[hash].enabled = true;
    
    find.call(self);
}

function disable (hash) {
    var self = this;
    // TODO add class with bind
    self.filters[hash].item.setAttribute('class', 'disabled');
    self.filters[hash].enabled = false;
    
    find.call(self);
}

function value (operator, value) {
    var self = this;
    
    if (typeof self.config.operators[operator] !== 'undefined') {
        
        var valueField = operators.valueField.call(self, operator, value);
        
        self.domRefs.inputs.value = valueField || {value: ''};
        self.domRefs.valueField.innerHTML = '';
        
        if (valueField && operator) {
            self.domRefs.valueLabel.style.display = 'block';
            self.domRefs.valueField.appendChild(valueField);
        } else {
            self.domRefs.valueLabel.style.display = 'none';
        }
    }
}

function createTypeSelectOption (type) {
    var option = elm('option', {value: type});
    option.innerHTML = type;
    return option;
}

function setTypes (types) {
    var self = this;
    
    if (types instanceof Array && self.domRefs.typeSelector) {
        var df = document.createDocumentFragment();
        
        self.types = {};
        
        for (var i = 0, l = types.length; i < l; ++i) {
            self.types[types[i]] = {};
            df.appendChild(createTypeSelectOption(types[i]));
        }
        
        self.domRefs.typeSelector.innerHTML = '';
        self.domRefs.typeSelector.appendChild(df);
    }
}

function changeType (type) {
    var self = this;
    
    if (typeof type !== 'string' || !type) {
        return;
    }
    
    // TODO get type from server or cache
    
    // set fields
    operators.buildFields.call(self);
    
    // TODO select field and update operators
    
    // set operators
    operators.buildOperators.call(self);
    
    self.type = type;
    
    // reset predefined filters
    setFilters.call(self, self.config.setFilters || [], true);
    
    // add type to typeSelector
    if (self.types && !self.types[type]) {
        self.types[type] = type;
        self.domRefs.typeSelector.appendChild(createTypeSelectOption(type));
    }
    
    // select type
    if (self.domRefs.typeSelector) {
        self.domRefs.typeSelector.value = type;
    }
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
    self.on('operatorChange', value);
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
    
    // operator change
    self.domRefs.inputs.operator.addEventListener('change', function () {
        self.emit('operatorChange', self.domRefs.inputs.operator.value);
    });
    
    // init type
    if (self.config.type) {
        self.emit('setType', self.config.type);
    }
}

exports.init = init;

return module; });