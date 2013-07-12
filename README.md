bind-filter
===========

Bind filter module (UI)

####Example config:
```
crud: 'crud', // miid of crud module
events: {
    add: 'click',
    cancel: 'click',
    create: 'click',
    remove: 'click',
    itemEdit: 'click',
    itemRemove: 'click'
},
filter: '.filter',
list: '.filter-list',
listItem: 'li',
valueLabel: '.valueLabel',
valueField: '.valueField',
inputs: {
    field: 'select[name=field]',
    operator: 'select[name=operator]'
},
controls: {
    create: 'button[name=create]',
    save: 'button[name=save]',
    cancel: 'button[name=cancel]',
    remove: 'button[name=remove]'
},
item: {
    onoff: '.onoff > input',
    field: '.field',
    operator: '.operator',
    value: '.value',
    remove: '.remove',
    handler: '.handler'
},
setFilters: [
    {
        field: 'id',
        operator: 'all',
        value: 'value1, value2 value3'
    },
    {
        field: 'name',
        operator: '=',
        value: 'herbert'
    }
],
enabled: false,
// TODO get field names and type dynamicaly from db
type: 'template',
fields: ['id', 'name', 'field2', 'field3', 'field4', 'field5']
```
