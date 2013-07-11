M.wrap('github/jillix/bind-filter/dev/operators.js', function (require, module, exports) {
// TODO use bind for dom interaction/manipulation
function elm(d,a){try{var b=document.createElement(d);if("object"===typeof a)for(var c in a)b.setAttribute(c,a[c]);return b}catch(e){return null}}

var operators = {
    '=': 'text',
    '!=': 'text',
    '>': 'number',
    '<': 'number',
    '>=': 'number',
    '<=': 'number',
    'all': 'text',
    'in': 'text',
    'not in': 'text',
    'regExp': 'text',
    'exists': null,
    'where': 'text',
    'mod': ['number', 'number'],
    'type': {type: 'number', min: 1, max: 18},
    'null': null,
    'not null': null
};
    
function build () {
    
    var df = document.createDocumentFragment();
    for (var operator in operators) {
        var option = elm('option', {value: operator});
        option.innerHTML = operator;
        df.appendChild(option);
    }
    return df;
}

function value (operator, value) {
    
    if (operators[operator]) {
        
        value = value || '';
        
        // TODO add interaction to value field
        if (typeof operators[operator] === 'string') {
            return elm('input', {
                name: 'value',
                value: value,
                type: operators[operator]
            });
        } else if (operators[operator] instanceof Array) {
            var df = document.createDocumentFragment();
            for (var i = 0, l = operators[operator].length; i < l; ++i) {
                df.appendChild(elm('input', {
                    name: 'value',
                    value: value,
                    type: operators[operator][i]
                }));
            }
            return df;
        } else if (operators[operator].type) {
            operators[operator].name = 'value';
            operators[operator].value = value;
            return elm('input', operators[operator]);
        } else {
            return elm('input', {name: 'value', type: 'text', value: value});
        }
    }
}

exports.build = build;
exports.value = value;

return module; });