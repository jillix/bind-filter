M.wrap('github/jillix/bind-filter/dev/controls.js', function (require, module, exports) {
var list = require('./list');
var find = require('./find');
var operators = require('./operators');

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
    
    if (!values) {
        self.domRefs.inputs.field.options[0].selected = true;
        self.domRefs.inputs.operator.options[0].selected = true;
        
        if (self.domRefs.inputs.value) {
            self.domRefs.inputs.value.value = '';
        }
    } else {
        self.domRefs.inputs.field.value = values.field;
        self.domRefs.inputs.operator.value = values.operator;
        
        if (self.domRefs.inputs.value) {
            self.domRefs.inputs.value.value = values.value;
        }
    }
}

function save () {
    var self = this;
    
    self.domRefs.filter.style.display = 'none';
    
    var values = getValues.call(self);
    list.save.call(self, values);
    
    // call server
    /*find.call(self, function (err) {
        // TODO enable ui
    });*/
}

function edit (li, values) {
    var self = this;
    
    if (li) {
        self.currentEdit = li;
        self.domRefs.controls.remove.style.display = 'inline';
    } else {
        self.currentEdit = null;
        self.domRefs.controls.remove.style.display = 'none';
    }
    
    // operator init
    value.call(self, self.domRefs.inputs.operator.value);
    resetValues.call(self, values);
    
    self.domRefs.filter.style.display = 'block';
}

function remove (li, values) {
    var self = this;
    self.domRefs.filter.style.display = 'none';
    
    list.remove.call(self, li);
}

function cancel () {
    var self = this;
    self.domRefs.filter.style.display = 'none';
}

function enable (li) {
    // TODO remove class with bind
    li.setAttribute('class', '');
}

function disable (li) {
    // TODO add class with bind
    li.setAttribute('class', 'disabled');
}

function value (operator) {
    var self = this;
    var valueField = operators.value.call(self, operator);
    
    self.domRefs.inputs.value = valueField || {value: ''};
    self.domRefs.valueField.innerHTML = '';
    
    if (valueField && operator) {
        self.domRefs.valueLabel.style.display = 'block';
        self.domRefs.valueField.appendChild(valueField);
    } else {
        self.domRefs.valueLabel.style.display = 'none';
    }
}

function init () {
    var self = this;
    
    // listen
    self.on('saveFilter', save);
    self.on('createFilter', edit);
    self.on('editFilter', edit);
    self.on('enableFilter', enable);
    self.on('disableFilter', disable);
    self.on('removeFilter', remove);
    self.on('cancelFilter', cancel);
    self.on('operatorChange', value);
    
    // add events to controls
    for (var handler in self.domRefs.controls) {
        self.domRefs.controls[handler].addEventListener(self.config.events[handler] || 'click', (function (handler) {
            return function () {
                self.emit(handler + 'Filter');
            }
        })(handler));
    }
    
    // operator change
    self.domRefs.inputs.operator.addEventListener('change', function () {
        self.emit('operatorChange', self.domRefs.inputs.operator.value);
    });
}

exports.init = init;

return module; });