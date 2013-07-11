M.wrap('github/jillix/bind-filter/dev/find.js', function (require, module, exports) {
// TODO build queries
var operators = {
    '=': '',
    '!=': '$ne',
    '>': '$gt',
    '<': '$lt',
    '>=': '$gte',
    '<=': '$lte',
    'all': '$all',
    'in': '$in',
    'not in': '$nin',
    'regExp': '$regex',
    'exists': '$exists',
    'where': '$where',
    'mod': '$mod',
    'type': '$type',
    'null': '',
    'not null': '$ne'
};

function queryBuilder (values) {
    
    var query = {};
    var field = {};
    
    if (values.operator === 'null' || values.operator === 'not null') {
        values.value = null;
    }
    
    if (values.operator === 'exists') {
        values.value = true;
    }
    
    field[values.field] = values.value;
    
    // handle operator
    if (operators[values.operator]) {
        query[operators[values.operator]] = field;
    } else {
        query = field;
    }
    
    return {q: query};
}

function find (values, callback) {
    var self = this;
    
    if (self.crudFindBusy) {
        return callback('Find is busy.');
    }
    
    self.crudFindBusy = true;
    
    // TODO build queries
    var query = queryBuilder(values);
    console.log(query);
    
    if (query) {
        self.emit('find', query, function (err, data) {
            self.crudFindBusy = false;
            self.emit('result', err, data);
            callback(err, data);
        });
    }
}

module.exports = find;

return module; });