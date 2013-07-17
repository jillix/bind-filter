M.wrap('github/jillix/bind-filter/dev/operators.js', function (require, module, exports) {
// TODO use bind for dom interaction/manipulation
function elm(d,a){try{var b=document.createElement(d);if("object"===typeof a)for(var c in a)b.setAttribute(c,a[c]);return b}catch(e){return null}}
    
function build () {
    var self = this;
    var df = document.createDocumentFragment();
    
    for (var operator in self.config.operators) {
        var option = elm('option', {value: operator});
        option.innerHTML = operator;
        df.appendChild(option);
    }
    return df;
}

function valueField (value) {
    return elm('input', {name: 'value', type: 'text', value: value || ''});
}

function validateValue (values) {
    var self = this;
    
    if (!self.config.operators[values.operator] || !values.value) {
        return false;
    }
    
    var validations = self.config.operators[values.operator];
    var value = values.value;
    
    // TODO validation
    /*for (var validation in validations) {
        switch (validation) {
            case 'type':
                
        }
    }*/
    
    console.log(validations);
    console.log(value);
    return true;
}

exports.build = build;
exports.valueField = valueField;
exports.validateValue = validateValue;

return module; });