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

function elm(d,a){try{var b=document.createElement(d);if("object"===typeof a)for(var c in a)b.setAttribute(c,a[c]);return b}catch(e){return null}}
function get(s,c){
    try{return (c||document).querySelector(s);}
    catch (err) {}
}

function find () {
    var self = this;
    
    if (self.crudFindBusy) {
        return;
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
        });
    }
}

function createFilterItem () {
    
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
    var checkbox = elm('checkbox', {checked:true});
    
    li.appendChild(onoff);
    li.appendChild(elm('span', {'class':'field'}));
    li.appendChild(elm('span', {'class':'operator'}));
    li.appendChild(elm('span', {'class':'value'}));
    li.appendChild(elm('span', {'class':'handler'}));
    return li;
}

function addFilter () {
    var self = this;
    
    // TODO get filter values
    var values = {};
    
    self.ui.filterList.appendChild(createFilterItem(values));
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
        find.call(self);
    },
    create: function () {
        var self = this;
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