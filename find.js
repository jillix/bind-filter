M.wrap('github/jillix/bind-filter/dev/find.js', function (require, module, exports) {

var currentFilters = {};

// TODO send template type always
function queryBuilder (filters) {
    var self = this;
    var query;
    
    for (filter in filters) {
        if (!filters[filter].disabled) {
            
            query = query || {};
            
            var values = filters[filter];
            var value = values.value;
            
            if (values.operator === 'null' || values.operator === 'not null') {
                value = null;
            }
            
            if (values.operator === 'exists') {
                value = true;
            }
            
            // handle value
            if (values.operator === 'all' || values.operator === 'in' || values.operator === 'not in' || values.operator === 'mod') {
                value = values.value.split(/ |, |,/g);
            }
            
            // handle operator
            if (self.config.operators[values.operator]) {
                // TODO handle complex queries
                query[values.field] = query[values.field] || {};
                query[values.field][self.config.operators[values.operator][0]] = value;
            } else {
                query[values.field] = value;
            }
        }
    }
    
    return query;
}

function find (all) {
    var self = this;
    
    if (!self.type) {
        return self.emit('result', null, 'No type selected.');
    }
    
    if (self.crudFindBusy) {
        return self.emit('result', null, 'Find is busy.');
    }
    
    self.crudFindBusy = true;
    
    // build queries
    self.query = all ? {} : queryBuilder.call(self, self.filters);
    
    if (!self.query) {
        
        if (self.wasEmpty) {
            self.crudFindBusy = false;
            return self.emit('result', null, 'empty query');
        }
        
        self.wasEmpty = true;
        self.query = {};
    } else {
        self.wasEmpty = false;
    }
    
    // get data with crud module
    return self.emit('find', {q: self.query, t: self.type}, function (err, data) {
        self.crudFindBusy = false;
        self.emit('result', err, data);
    });
}

module.exports = find;

return module; });