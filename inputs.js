M.wrap('github/jillix/bind-filter/dev/inputs.js', function (require, module, exports) {
// TODO use bind for dom interaction/manipulation
function elm(d,a){try{var b=document.createElement(d);if("object"===typeof a)for(var c in a)b.setAttribute(c,a[c]);return b}catch(e){return null}}
    
function fields () {
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

function checkOperator (fieldType, operator) {
    var self = this;
    
    if (self.config.operators[operator][1] === fieldType || self.config.operators[operator][1] === 'mixed') {
        return true;
    }
}

function value (field, operator, value) {
    var self = this;
    
    if (!self.types[self.type][field] || !self.types[self.type][field].type) {
        return;
    }
    
    var fieldType = self.config.operators[(operator || '=')][2] || self.types[self.type][field].type;
    var input;
    
    // operators
    var df = document.createDocumentFragment();
    for (var op in self.config.operators) {
        if (checkOperator.call(self, fieldType, op)) {
            var option = elm('option', {value: op});
            option.innerHTML = op;
            if (op === operator) {
                option.setAttribute('selected', true);
            }
            df.appendChild(option);
        }
    }
    
    self.domRefs.inputs.operator.innerHTML = '';
    self.domRefs.inputs.operator.appendChild(df);
    
    // handle boolean input
    if (fieldType === 'boolean') {
        var select = elm('select', {name: 'value'});
        var opt1 = elm('option', {value: 'true'});
        opt1.innerHTML = 'true';
        
        var opt2 = elm('option', {value: 'false'});
        opt2.innerHTML = 'false';
        
        select.appendChild(opt1);
        select.appendChild(opt2);
        select.value = value;
        input = select;
        
    // handle array input
    } else if (fieldType === 'array') {
        var array = elm('input', {name: 'value', type: 'text', value: value || ''});
        // TODO implement tag input plugin here...
        /*array.addEventListener('keyup', function (event) {
            if (event.keyCode === 13) {
                console.log(array.value);
            }
        });*/
        input = array;
        
    // handle number and text input
    } else {
        fieldType = fieldType === 'number' ? 'number' : 'text';
        input = elm('input', {name: 'value', type: fieldType, value: value || ''});
    }
    
    self.domRefs.inputs.value = input;
    self.domRefs.valueField.innerHTML = '';
    self.domRefs.valueField.appendChild(input);
}

function validate (values) {
    var self = this;
    var schema = self.types[self.type];
    
    // check if field and operator exists
    if (!schema[values.field] || !self.config.operators[values.operator]) {
        return false;
    }
    
    // check strings
    if (schema[values.field].type === 'string' && typeof values.value !== 'string') {
        return false;
    }
    
    // check number
    if (schema[values.field].type === 'number' && typeof values.value !== 'number') {
        return false;
    }
    
    return true;
}

exports.value = value;
exports.fields = fields;
exports.validate = validate;

return module; });