M.wrap('github/jillix/bind-filter/dev/filter.js', function (require, module, exports) {

// ONLY FOR DEV
var tmpConfig = {
    crud: 'crud',
    events: {
        add: 'click',
        cancel: 'click',
        create: 'click',
        remove: 'click'
    },
    controls: {
        filter: '.filter',
        filterList: '.filter-list',
        create: 'button[name=create]',
        add: 'button[name=add]',
        cancel: 'button[name=cancel]',
        remove: 'button[name=remove]',
        field: 'select[name=field]',
        operator: 'select[name=operator]',
        value: 'input[name=value]'
    }
};

// TODO use bind for dom interaction/manipulation
function elm(d,a){try{var b=document.createElement(d);if("object"===typeof a)for(var c in a)b.setAttribute(c,a[c]);return b}catch(e){return null}}
function get(s,c){
    try{return (c||document).querySelector(s);}
    catch (err) {}
}

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

function createFilterItem (values) {
    var self = this;
    // TODO make the filter item configurable
    /*<li>
        <span class="onoff"><input type="checkbox" checked=""></span>
        <span class="logic"></span>
        <span class="field">Field Name</span>
        <span class="operator">=</span>
        <span class="value">filter value</span>
        <span class="handler">#</span>
    </li>*/
    var li = elm('li');
    var onoff = elm('span', {'class': 'onoff'});
    onoff.appendChild(elm('input', {type: 'checkbox', checked:true}));
    li.appendChild(onoff);
    
    var value = elm('span', {'class':'value'});
    value.innerHTML = values.value || '';
    
    var operator = elm('span', {'class':'operator'});
    operator.innerHTML = values.operator;
    
    var field = elm('span', {'class':'field'});
    field.innerHTML = values.field;
    
    var remove = elm('span', {'class':'remove'});
    remove.innerHTML = 'x';
    remove.addEventListener('click', function () {
        self.ui.filterList.removeChild(li);
    });
    
    var handler = elm('span', {'class':'handler'});
    handler.innerHTML = '#';
    
    li.appendChild(field);
    li.appendChild(operator);
    li.appendChild(value);
    li.appendChild(remove);
    li.appendChild(handler);
    return li;
}

function addFilter () {
    var self = this;
    
    // TODO get filter values
    var values = {
        field: self.ui.field.value,
        operator: self.ui.operator.value || '=',
        value: self.ui.value.value
    };
    
    self.ui.filterList.appendChild(createFilterItem.call(self, values));
}

// TODO remove filter
function removeFilter () {
    var self = this;
}

var uiHandlers = {
    cancel: function () {
        var self = this;
        self.ui.filter.style.display = 'none';
    },
    add: function () {
        var self = this;
        
        // TODO disable ui
        self.ui.filter.style.display = 'none';
        
        // call server
        find.call(self, function (err) {
            // TODO enable ui
        });
    },
    create: function () {
        var self = this;
        
        // TODO reset form
        self.ui.filter.style.display = 'block';
    },
    remove: function () {
        var self = this;
        self.ui.filter.style.display = 'none';
    }
};

function initDom () {
    var self = this;
    
    if (!self.config.controls) {
        return console.error('No controls found.');
    }
    
    self.ui = {};
    
    for (var name in self.config.controls) {
        
        // find, cache and validate dom elements
        if (!(self.ui[name] = get(self.config.controls[name], self.dom))) {
            return console.error('Mandatory field not found: ' + name);
        }
        
        // add events
        if (uiHandlers[name]) {
            self.ui[name].addEventListener(self.config.events[name], (function (name) {
                return function () {
                    uiHandlers[name].call(self);
                };
            })(name), false);
        }
    }
}

function init (config) {
    
    // ONLY FOR DEV
    config = tmpConfig;
    
    var self = this;
    self.config = config;
    
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