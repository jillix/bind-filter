var currentFilters = {};

function queryBuilder (filters) {
    var self = this;
    var query = {};
    var fieldsInQuery = {};

    for (filter in filters) {
        if (!filters.hasOwnProperty(filter)) continue;
        var cFilter = filters[filter];

        if (!cFilter.disabled && self.config.operators[cFilter.operator]) {

            var expression = {};
            var value = cFilter.value;
            var operator = self.config.operators[cFilter.operator];

            // handle operators
            if (operator[0]) {
                expression[cFilter.field] = {};
                expression[cFilter.field][operator[0]] = value;
            } else {
                expression[cFilter.field] = value;
            }

            // handle or
            if (fieldsInQuery[cFilter.field]) {
                // create or array and move the existing expression to the array
                if (!query.$or) {
                    query.$or = [{}];
                    query.$or[0][cFilter.field] = query[cFilter.field];
                    delete query[cFilter.field];
                }
                query.$or.push(expression);
            } else {
                query[cFilter.field] = expression[cFilter.field];
            }

            fieldsInQuery[cFilter.field] = 1;
        }
    }
    return {
        t: self.template,
        q: query,
        o: self.options
    };
}

function find (all, callback) {
    var self = this;

    // callback must be a function
    callback = callback || function () {};

    if (!self.template) {
        var err = new Error('NO_TEMPLATE_SELECTED');
        callback (err);
        return self.emit('result', err);
    }

    if (self.crudFindBusy) {
        var err = new Error('FILTER_IS_BUSY');
        callback (err);
        return self.emit('result', err);
    }

    self.crudFindBusy = true;

    // build queries
    self.query = all ? {} : queryBuilder.call(self, self.filters);

    if (!self.query) {

        if (self.wasEmpty) {
            self.crudFindBusy = false;
            var err =  new Error('NO_FILTERS_SELECTED');
            callback (err);
            return self.emit('result', err);
        }

        self.wasEmpty = true;
        self.query = {};
    } else {
        self.wasEmpty = false;
    }

    // get data with crud module
    return self.emit('find', self.query, function (err, data, xhr) {

        self.crudFindBusy = false;

        if (err) {
            err = err.message || err;
            callback (err);
            return console.error(err);
        }

        var count;

        // verify if xhr exists
        if (xhr) {
            // it exists, so get the count from response
            count = xhr.getResponseHeader('X-Mono-CRUD-Count');
        }

        callback (err, data, count);
        self.emit('result', err, data, count);
    });
}

module.exports = find;
