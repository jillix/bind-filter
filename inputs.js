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
function checkOperator (fieldType, operator) {
    var self = this;
    
    if (self.config.operators[operator][1] === fieldType || self.config.operators[operator][1] === 'mixed') {
        return true;
    }
}

function buildOperators (field, operator) {
    var self = this;
    
    if (!self.types[self.type][field] || !self.types[self.type][field].type) {
        return;
    }
    
    var fieldType = self.types[self.type][field].type;
    var df = document.createDocumentFragment();
    
    for (var operator in self.config.operators) {
        if (checkOperator.call(self, fieldType, operator)) {
            var option = elm('option', {value: operator});
            option.innerHTML = operator;
            df.appendChild(option);
        }
    }
    
    self.domRefs.inputs.operator.innerHTML = '';
    self.domRefs.inputs.operator.appendChild(df);
}

// TODO create a input field of the schema field type
function buildValue (field, value) {
    var self = this;
    
    if (!self.types[self.type][field] || !self.types[self.type][field].type) {
        return;
    }
    
    var fieldType = self.types[self.type][field].type;
    var input;
    
    // handle boolean input
    if (fieldType === 'boolean') {
        var select = elm('select', {name: 'value', value: value || ''});
        var opt1 = elm('option', {value: true});
        opt1.innerHTML = 'true';
        
        var opt2 = elm('option', {value: false});
        opt2.innerHTML = 'false';
        
        select.appendChild(opt1);
        select.appendChild(opt2);
        input = select;
    }
    
    // handle array input
    if (fieldType === 'array') {
        var array = elm('input', {name: 'value', type: 'text', value: value || ''});
        // TODO implement tag input plugin here...
        /*array.addEventListener('keyup', function (event) {
            if (event.keyCode === 13) {
                console.log(array.value);
            }
        });*/
        input = array;
    }
    
    // handle number and text input
    fieldType = fieldType === 'number' ? 'number' : 'text';
    input = elm('input', {name: 'value', type: fieldType, value: value || ''});
    
    self.domRefs.inputs.value = input;
    
    self.domRefs.valueField.innerHTML = '';
    self.domRefs.valueField.appendChild(self.domRefs.inputs.value);
}

function validate (values) {
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
exports.validate = validate;

return module; });