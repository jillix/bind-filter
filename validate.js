function convert (values) {
    var self = this;
    var schema = self.templates[self.template].schema;
    
    if (typeof value === 'string') {
        if (values.value === 'false') {
            values.value = false;
        } else if (values.value === 'true') {
            values.value = true;
        } else if (schema[values.field].type === 'number') {
            values.value = values.value.indexOf('.') > -1 ? parseFloat(values.value) : parseInt(values.value, 10);
        }
    }

    return values;
}

function validate (values) {
    var self = this;
    var schema = self.templates[self.template].schema;
    
    // check if field and operator exists
    if (!schema[values.field] || !self.config.operators[values.operator]) {
        return false;
    }

    return true;
}

exports.convert = convert;
exports.validate = validate;
