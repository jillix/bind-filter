M.wrap('github/jillix/bind-filter/dev/inputs.js', function (require, module, exports) {
// TODO use bind for dom interaction/manipulation
function elm(d,a){try{var b=document.createElement(d);if("object"===typeof a)for(var c in a)b.setAttribute(c,a[c]);return b}catch(e){return null}}

function fields () {
    var self = this;
    var fields = self.templates[self.template];

    var df = document.createDocumentFragment();
    for (var field in fields) {
        if (field.indexOf('_') !== 0) {
            var option = elm('option', {value: field});
            option.innerHTML = field;
            df.appendChild(option);
        }
    }

    if (self.domRefs.inputs.field) {
        self.domRefs.inputs.field.innerHTML = '';
        self.domRefs.inputs.field.appendChild(df);
    }
}

function checkOperator (fieldType, operator) {
    var self = this;

    if (self.config.operators[operator][1] === fieldType || self.config.operators[operator][1] === 'mixed') {
        return true;
    }
}

function value (field, operator, value) {
    var self = this;

    if (!self.templates[self.template][field] || !self.templates[self.template][field].template) {
        return;
    }

    var fieldType = self.config.operators[(operator || '=')][2] || self.templates[self.template][field].template;
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

    if (self.domRefs.inputs.operator) {
        self.domRefs.inputs.operator.innerHTML = '';
        self.domRefs.inputs.operator.appendChild(df);
    }

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
    } else if (fieldType === 'number') {
        input = elm('input', {name: 'value', type: 'number', value: value || '', step: 'any'});
    } else {
        input = elm('input', {name: 'value', type: 'text', value: value || ''});
    }

    self.domRefs.inputs.value = input;

    if (self.domRefs.valueField) {
        self.domRefs.valueField.innerHTML = '';
        self.domRefs.valueField.appendChild(input);
    }
}

function convert (values) {
    var self = this;
    var schema = self.templates[self.template];

    // check number
    if (schema[values.field].type === 'number') {
        values.value = values.value.indexOf('.') > -1 ? parseFloat(values.value) : parseInt(values.value, 10);
    } else {
        values.value = values.value.toString();
    }

    return values;
}

function validate (values) {
    var self = this;
    var schema = self.templates[self.template];

    // check if field and operator exists
    if (!schema[values.field] || !self.config.operators[values.operator]) {
        return false;
    }

    return true;
}

exports.value = value;
exports.fields = fields;
exports.convert = convert;
exports.validate = validate;

return module; });
