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
        // TODO start state of the filter
        enabled: true,
        // TODO do not allow UI removal
        fixed: true,
        // TODO hide from the UI
        hidden: true
    },
    {
        field: 'name',
        operator: '=',
        value: 'herbert'
    }
],
// TODO this might become obsolete when this option can be set on individual filters
enabled: false,
// TODO - get field names and type dynamicaly from db
//      - the type should define what fields are searchable and which not (probably all default searchable)
//      - this module should react to a different events and call a "set type" operation that reconfigures it
type: 'template',
fields: ['id', 'name', 'field2', 'field3', 'field4', 'field5']
```
