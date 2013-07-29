bind-filter
===========

Bind filter module (UI)

####Example config:
```js
// miid of crud module
crud: 'crud',
// what DOM event will trigger a filter UI interaction?
events: {
    add: 'click',
    cancel: 'click',
    create: 'click',
    remove: 'click',
    itemEdit: 'click',
    itemRemove: 'click'
},
// the container of the filter form
filter: '.filter',
// the container of the filter list
list: '.filter-list',
// the selector to the filter list item template
listItem: 'li',
// the value label selector (probably to be renamed to "container")
valueLabel: '.valueLabel',
// the value field container (can be 0 or more values, depending on the operator)
valueField: '.valueField',
// the type selector input element
typeSelector: '.types',
// DOM references to the field and operator inputs
inputs: {
    field: 'select[name=field]',
    operator: 'select[name=operator]'
},
// DOM references to the filter UI controls
controls: {
    create: 'button[name=create]',
    save: 'button[name=save]',
    cancel: 'button[name=cancel]',
    remove: 'button[name=remove]'
},
// filter list item reference
item: {
    // enable-diable filter DOM reference
    onoff: '.onoff > input',
    // filter field DOM reference
    field: '.field',
    // filter operator DOM reference
    operator: '.operator',
    // filter value DOM reference
    value: '.value',
    // filter remove control DOM reference
    remove: '.remove',
    // TODO
    handler: '.handler'
},
// pre-defined filters
setFilters: [
    {
        field: 'id',
        operator: 'all',
        value: 'value1, value2 value3',
        // start state of the filter
        disbaled: false,
        // do not allow UI removal
        fixed: true,
        // hide from the UI
        hidden: true
    },
    {
        field: 'name',
        operator: '=',
        value: 'herbert'
    }
],
// define type to select
setTypes: ['typeA', 'template', 'typeB'],
// set type
type: 'template',

// listen to external events
listen: {
    /*
        see here how to config:
        https://github.com/jillix/events
    */
}
```

####Event interface
#####result
```js
self.emit('result', function (err, data) {});
```

#####setFilters
```js
self.on('setFilters', [{
    field: 'fieldName',
    operator: '=',
    value: 23,
    disabled: false,
    hidden: false,
    fixed: false
}]);
```

**Supported operators**

| Operator | Mongo Equivalent         | Comments |
| -------- |:------------------------ | -------- |
| `=`      | `key`: `value` notation  | |
| `!=`     | `$ne`                    | |
| `>`      | `$gt`                    | |
| `<`      | `$lt`                    | |
| `>=`     | `$gte`                   | |
| `<=`     | `$lte`                   | |
| `all`    | `$all`                   | |
| `in`     | `$in`                    | |
| `notin`  | `$nin`                   | |
| `regExp` | `$regex`                 | |
| `exists` | `$exists`                | |

#####setType
```js
self.emit('setType', 'typeName', function () {});
```

#####setTypes
```js
self.emit('setTypes', ['typeName'], function () {});
```

#####setOptions
```js
/*
if true is set as second parameter, the options are set
to the first parameter, otherwise the options are merged
*/
self.emit('setOptions', {limit: 20, fields: {}, ...}, true);
```
