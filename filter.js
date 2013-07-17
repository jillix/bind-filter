M.wrap('github/jillix/bind-filter/dev/filter.js', function (require, module, exports) {
// ONLY FOR DEV
var tmpConfig = {
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
    typeSelector: '.filter select[name=type]',
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
    setTypes: ['typeA', 'template', 'typeB'],
    enabled: false,
    // TODO get field names and type dynamicaly from db
    type: 'template',
    fields: ['id', 'name', 'field2', 'field3', 'field4', 'field5']
};

var controls = require('./controls').init;
var operators = require('./operators');
var operatorConfig = {
    '=': ['', 'text'],
    '!=': ['$ne', 'text'],
    '>': ['$gt', 'number'],
    '<': ['$lt', 'number'],
    '>=': ['$gte', 'number'],
    '<=': ['$lte', 'number'],
    'all': ['$all', 'array'],
    'in': ['$in', 'array'],
    'notin': ['$nin', 'array'],
    'regExp': ['$regex', 'text'],
    'exists': ['$exists', 'boolean'],
    'where': ['$where', 'text'],
    'mod': ['$mod', 'array', {
        maxLength: 2,
        minLength: 2
    }],
    'type': ['$type', 'number', {
        int: true,
        max: 18,
        min: 1,
    }]
};

// TODO use bind for dom interaction/manipulation
function get(s,c){
    try{return (c||document).querySelector(s);}
    catch (err) {
        return null;
    }
}

function initDom () {
    var self = this;
    
    if (!self.config.controls) {
        return console.error('No controls found.');
    }
    
    // get dom refs
    self.domRefs = {};
    self.domRefs.filter = get(self.config.filter, self.dom);
    self.domRefs.valueLabel = get(self.config.valueLabel, self.dom);
    self.domRefs.valueField = get(self.config.valueField, self.dom);
    self.domRefs.typeSelector= get(self.config.typeSelector, self.dom);
    
    // list item
    self.domRefs.list = get(self.config.list, self.dom);
    self.domRefs.listItem = get(self.config.listItem, self.domRefs.list);
    self.domRefs.list.innerHTML = '';
    
    self.domRefs.inputs = {};
    for (var name in self.config.inputs) {
        self.domRefs.inputs[name] = get(self.config.inputs[name], self.dom);
    }
    
    self.domRefs.controls = {};
    for (var name in self.config.controls) {
        self.domRefs.controls[name] = get(self.config.controls[name], self.dom);
    }
    
    controls.call(self);
}

function init (config) {
    
    // ONLY FOR DEV
    _SELF = this;
    config = tmpConfig;
    
    var self = this;
    self.config = config;
    self.filters = {};
    self.types = {};
    self.config.operators = operatorConfig;
    
    if (!config.crud) {
        return console.error('No crud miid defined.');
    }
    
    // wait for the crud module
    self.onready(config.crud, function () {
        initDom.call(self);
        self.emit('ready');
    });
}

module.exports = init;

return module; });