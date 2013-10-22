M.wrap('github/jillix/bind-filter/dev/inputs.js', function (require, module, exports) {
// TODO use bind for dom interaction/manipulation
function elm(d,a) {
    try {
        var b = document.createElement(d);
        if ("object" === typeof a) {
            for (var c in a) {
                if (!a.hasOwnProperty(c)) continue;
                b.setAttribute(c, a[c]);
            }
            return b;
        }
    } catch (e) {
        return null;
    }
}

var getFieldLabel = require('./validate').getFieldLabel;

function fields () {
    var self = this;
    var fields = self.templates[self.template].schema;

    var df = document.createDocumentFragment();
    var locale = M.getLocale();
    for (var field in fields) {
        if (!fields.hasOwnProperty(field)) continue;

        if (field.indexOf('_') !== 0 && !fields[field].noSearch) {
            var option = elm('option', {value: field});
            option.innerHTML = getFieldLabel.call(self, field, locale);
            df.appendChild(option);
        }
    }

    if (self.domRefs.inputs.field) {
        self.domRefs.inputs.field.innerHTML = '';
        self.domRefs.inputs.field.appendChild(df);
    }
}

function checkOperator (fieldTemplate, operator) {
    var self = this;
    
    if (self.config.operators[operator][1] === 'mixed' || (self.config.operators[operator][1].indexOf(fieldTemplate) > -1)) {
        return true;
    }
}

function value (field, operator, value, editMode) {
    var self = this;
    
    if (!self.template || !self.templates[self.template].schema[field] || !self.templates[self.template].schema[field].type) {
        return;
    }
    
    var fieldTemplate = self.templates[self.template].schema[field].type;
    var input;
    
    // refresh operators when changing the field
    if (!operator || editMode) {
        var df = document.createDocumentFragment();
        var order = self.config.ui.operatorOrder;
        
        for (var i = 0; i < order.length; ++i) {

            var op = order[i];
            if (checkOperator.call(self, fieldTemplate, op)) {
                var option = elm('option', {value: op});
                option.innerHTML = self.config.i18n ? (self.config.i18n[op] || op) : op;
    
                // select operator
                if (operator === op) {
                    option.setAttribute('selected');
                }
                
                df.appendChild(option);
            }
        }
        
        if (self.domRefs.inputs.operator) {
            self.domRefs.inputs.operator.innerHTML = '';
            self.domRefs.inputs.operator.appendChild(df);
        }
    }
    
    // handle boolean input
    if ((operator && self.config.operators[operator][2] === 'boolean') || fieldTemplate === 'boolean') {
        var select = elm('select', {name: 'value'});
        var opt1 = elm('option', {value: 'true'});
        opt1.innerHTML = self.config.i18n['true'] || 'true';

        var opt2 = elm('option', {value: 'false'});
        opt2.innerHTML = self.config.i18n['false'] || 'false';

        select.appendChild(opt1);
        select.appendChild(opt2);
        select.value = value;

        input = select;

    // handle array input
    } else if (fieldTemplate === 'array' || (operator && self.config.operators[operator][2] === 'split')) {
        var array = elm('input', {name: 'value', type: 'text', value: value || ''});
        // TODO implement tag input plugin here...
        /*array.addEventListener('keyup', function (event) {
            if (event.keyCode === 13) {
                console.log(array.value);
            }
        });*/
        input = array;

    // handle number and text input
    } else if (fieldTemplate === 'number' && (operator && self.config.operators[operator][2] !== 'split')) {
        input = elm('input', {name: 'value', type: 'number', value: value || '', step: 'any'});
    } else {
        input = elm('input', {name: 'value', type: 'text', value: value || ''});
    }
    
    // adding custom classes
    if (self.config.ui && self.config.ui.classes) {
        input.setAttribute("class", input.getAttribute("class") || '' + " " + self.config.ui.classes.value || '');
    }

    self.domRefs.inputs.value = input;

    // emit a saveFilter when pressing Enter while focused on this input
    self.domRefs.inputs.value.addEventListener('keyup', function(event) {
        if (event.keyCode === 13) {
            self.emit('saveFilter');
            self.domRefs.inputs.value.blur();
        }

        if(event.keyCode === 27) {
            self.emit('cancelFilter');
            self.domRefs.inputs.value.blur();
        }
    });

    if (self.domRefs.valueField) {
        self.domRefs.valueField.innerHTML = '';
        self.domRefs.valueField.appendChild(input);
    }
}

exports.value = value;
exports.fields = fields;


return module; });
