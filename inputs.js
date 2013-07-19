M.wrap('github/jillix/bind-filter/dev/inputs.js', function (require, module, exports) {
// TODO use bind for dom interaction/manipulation
function elm(d,a){try{var b=document.createElement(d);if("object"===typeof a)for(var c in a)b.setAttribute(c,a[c]);return b}catch(e){return null}}
    
function buildFields () {
    var self = this;
    var fields = self.types[self.type];
    
    var df = document.createDocumentFragment();
    for (var field in fields) {
        var option = elm('option', {value: field});
        option.innerHTML = field;
        df.appendChild(option);
    }
    
    self.domRefs.inputs.field.innerHTML = '';
    self.domRefs.inputs.field.appendChild(df);
}

// TODO show only the operators which are compatible with the field type
function buildOperators () {
    var self = this;
    var df = document.createDocumentFragment();
    
    for (var operator in self.config.operators) {
        var option = elm('option', {value: operator});
        option.innerHTML = operator;
        df.appendChild(option);
    }
    
    self.domRefs.inputs.operator.appendChild(df);
}

function buildValue (field, value) {
    var self = this;
    if (self.domRefs.inputs.value) {
        self.domRefs.inputs.value.innerHTML = value || '';
    } else {
        var tmp_value = elm('input', {type: 'text', name: 'value', value: value || ''});
        self.domRefs.inputs.value = tmp_value;
    }
    
    self.domRefs.valueField.innerHTML = '';
    self.domRefs.valueField.appendChild(self.domRefs.inputs.value);
    
    /*if (typeof self.config.operators[operator] !== 'undefined') {
        
        var valueField = operators.valueField.call(self, operator, value);
        
        self.domRefs.inputs.value = valueField || {value: ''};
        self.domRefs.valueField.innerHTML = '';
        
        if (valueField && operator) {
            self.domRefs.valueLabel.style.display = 'block';
            self.domRefs.valueField.appendChild(valueField);
        } else {
            self.domRefs.valueLabel.style.display = 'none';
        }
    }*/
}

// TODO create a input field of the schema field type
function valueField (operator, value) {
    var self = this;
    var type = self.config.operators[operator][1];
    
    // handle boolean input
    if (type === 'boolean') {
        var select = elm('select', {name: 'value', value: value || ''});
        var opt1 = elm('option', {value: true});
        opt1.innerHTML = 'true';
        
        var opt2 = elm('option', {value: false});
        opt2.innerHTML = 'false';
        
        select.appendChild(opt1);
        select.appendChild(opt2);
        return select;
    }
    
    // handle array input
    if (type === 'array') {
        var array = elm('input', {name: 'value', type: 'text', value: value || ''});
        // TODO implement tag input plugin here...
        /*array.addEventListener('keyup', function (event) {
            if (event.keyCode === 13) {
                console.log(array.value);
            }
        });*/
        return array;
    }
    
    // handle number and text input
    return elm('input', {name: 'value', type: type, value: value || ''});
}

function validateValue (values) {
    var self = this;
    
    if (!self.config.operators[values.operator] || !values.value) {
        return false;
    }
    
    var validations = self.config.operators[values.operator];
    var value = values.value;
    
    // TODO validate with schema
    
    return true;
}

exports.buildOperators = buildOperators;
exports.buildFields = buildFields;
exports.buildValue = buildValue;
exports.valueField = valueField;
exports.validateValue = validateValue;

return module; });