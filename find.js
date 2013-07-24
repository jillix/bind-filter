M.wrap('github/jillix/bind-filter/dev/find.js', function (require, module, exports) {
var currentFilters = {};

function queryBuilder (filters) {
    var self = this;
    var query = {};
    var fieldsInQuery = {};
    
    for (filter in filters) {
        if (!filters[filter].disabled && self.config.operators[filters[filter].operator]) {
            
            var expression = {};
            var values = filters[filter];
            var value = values.value;
            
            // handle array value
            if (self.config.operators[values.operator][1] === 'array') {
                value = values.value.split(/ |, |,/g);
            }
            
            // handle operators
            if (self.config.operators[values.operator][0]) {
                expression[values.field] = {};
                expression[values.field][self.config.operators[values.operator][0]] = value;
            } else {
                expression[values.field] = value;
            }
            
            // handle or
            if (fieldsInQuery[values.field]) {
                
                // create or array and move the existing expression to the array
                if (!query.$or) {
                    query.$or = [{}];
                    query.$or[0][values.field] = query[values.field];
                    delete query[values.field];
                }
                
                query.$or.push(expression);
            } else {
                query[values.field] = expression[values.field];
            }
            
            fieldsInQuery[values.field] = 1;
        }
    }
    
    return {
        t: self.type,
        q: query,
        o: {limit: 20}
    };
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
    return self.emit('find', self.query, function (err, data) {
        self.crudFindBusy = false;
        self.emit('result', err, data);
    });
}

module.exports = find;

return module; });