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
        self.domRefs.inputs.value.value = '';
    } else {
        self.domRefs.inputs.field.value = values.field;
        self.domRefs.inputs.operator.value = values.operator;
        self.domRefs.inputs.value.value = values.value;
    }
}

function save () {
    var self = this;
    
    // TODO disable ui
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

function enable () {
    console.log('enable: ' + this.miid);
}

function disable () {
    console.log('disable: ' + this.miid);
}

function value (operator) {
    var self = this;
    
    //operators.value.call(self, operator);
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