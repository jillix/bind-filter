// TODO build queries
function queryBuilder (domRefs) {
    
    var values = {};
    var value = {};
    var query = {};
    
    for (var domRef in domRefs) {
        values[domRef] = domRefs[domRef].value;
    }
    
    // field value
    value[values.field] = values.value;
    
    if (values.operator !== '') {
        query[values.operator] = value;
    } else {
        query = value;
    }
    
    return {q: query};
}

function find (callback) {
    var self = this;
    
    if (self.crudFindBusy) {
        return callback('Find is busy.');
    }
    
    self.crudFindBusy = true;
    
    // TODO build queries
    var query = queryBuilder(self.ui);
    console.log(query);
    
    addFilter.call(self);
    
    if (query) {
        self.emit('find', query, function (err, data) {
            self.crudFindBusy = false;
            self.emit('result', err, data);
            callback(err);
        });
    }
}
