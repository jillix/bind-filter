bind-filter
===========

Bind filter module (UI)

####Example config:
```js
// miid of crud module
crud: 'crud',
// ui configuration (optional)
ui: {
    //operator order configuration (optional)
    //this will tell the module in whitch order to display the operators
    "operatorOrder": [
        "regExp",
        "in",
        "=",
        "!=",
        ">",
        "<",
        ">=",
        "<=",
        "exists",
        "notin",
        "all"
    ],
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
    // the template selector input element
    templateSelector: '.templates',
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
        // filter edit DOM reference
        edit: '.edit'
    },
    // configure message dom
    message: {
        // the message container
        container: '.message',
        // the measste text
        text: '.message .text'
    },
    // configure loader dom refs
    loader: {
        // the actual loader
        loader: '.progress',
        // all elements that should be hidden during a request
        hide: '.hideOnLoad'
    },

    // set custom classes on filter inputs
    classes: {
        // set class for the value field
        value: "myCustomClass"
    }
},
// pre-defined filters
setFilters: [
    {
        field: 'id',
        operator: 'all',
        value: 'value1, value2 value3',
        // start state of the filter
        disabled: false,
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
// define templates to select
setTemplates: ['typeA', 'template', 'typeB'],
// set template
template: 'template',

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

Errors:

- `NO_TEMPLATE_SELECTED` when a filtering is started before a template is set for the filter module
- `FILTER_IS_BUSY` when a filtering is started while a previous one is not yet finished
- `NO_FILTERS_SELECTED` when a 2nd consecutive filtering operation is tried with no query

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

#####setTemplate
```js
self.emit('setTemplate', 'templateName', function () {});
```

#####setTemplates
```js
self.emit('setTemplate', ['templateName'], function () {});
```

#####setOptions
```js
/*
if true is set as second parameter, the options are set
to the first parameter, otherwise the options are merged
*/
self.emit('setOptions', {limit: 20, fields: {}, ...}, true);
```

#####template
```js
self.emit('template', {
    id: '',
    name: '',
    schema: {/*modm schema*/}
};
```

#####templates
```js
self.emit('templates', [{
    id: '',
    name: '',
    schema: {/*modm schema*/}
}];
```

#####message
```js
self.emit('message', 'error', 'Message text');
```
Types: `alert` `error` `success` `info`

## Changelog

### dev

### v0.2.1
 - Handle `$or` operator correctly
 - Added `utils` library as dependency
 - Replaced double quotes with simple ones

### v0.2.0
 - added dynamic custom pre-defined filter support
 - Updated to `bind@v0.3.0` and `events@v0.3.0`

### v0.1.9
 - Enable the filter if it is disabled when saving it

### v0.1.8
 - fixed `setAttribute` bug [#22](https://github.com/jillix/bind-filter/issues/22)

### v0.1.7
 - Events v0.1.8

### v0.1.6
 - Fixed the wrong condition when selecting "first item" in the field select: search for first **non-core key** and which doesn't have `noSearch: true`
### v0.1.5
 - getItem fetches now only one item
### v0.1.4
 - added comparison operators to `date` values

### v0.1.3
 - send `hidden` field in `getFilters`
 - update to Bind v0.2.1

### v0.1.2
 - `crudFindBusy = false` before handling the error from find request
 - fixed displaying `Array` values in the value input in IE8

### v0.1.1
 - callback function feature for findfunction

### v0.1.0
 - Initial versioned release

