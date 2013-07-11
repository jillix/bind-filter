M.wrap('github/jillix/bind-filter/dev/list.js', function (require, module, exports) {
var controls = require('./controls');

// TODO use bind for dom interaction/manipulation
function elm(d,a){try{var b=document.createElement(d);if("object"===typeof a)for(var c in a)b.setAttribute(c,a[c]);return b}catch(e){return null}}
function get(s,c){
    try{return (c||document).querySelector(s);}
    catch (err) {}
}

function createFilterItem (values) {
    var self = this;
    var item = self.domRefs.listItem.cloneNode(true);
    var checkbox = get(self.config.item.onoff, item);
    var field = get(self.config.item.field, item);
    var operator = get(self.config.item.operator, item);
    var value = get(self.config.item.value, item);
    var handler = get(self.config.item.handler, item);
    var rm = get(self.config.item.remove, item);
    
    // enable/disable filter
    checkbox.addEventListener('change', function (event) {
        if (checkbox.checked) {
            self.emit('enableFilter', item, values);
        } else {
            self.emit('disableFilter', item, values);
        }
    }, false);
    
    field.innerHTML = values.field;
    field.addEventListener(self.config.events.itemEdit || 'click', function () {
        self.emit('editFilter', item, values);
    }, false);
    
    operator.innerHTML = values.operator;
    operator.addEventListener(self.config.events.itemEdit || 'click', function () {
        self.emit('editFilter', item, values);
    }, false);
    
    value.innerHTML = values.value || '';
    value.addEventListener(self.config.events.itemEdit || 'click', function () {
        self.emit('editFilter', item, values);
    }, false);
    
    // remove filter
    rm.innerHTML = 'x';
    rm.addEventListener(self.config.events.itemRemove || 'click', function () {
        self.emit('removeFilter', item, values);
    }, false);
    
    // TODO sort filter (drag'n drop)
    handler.innerHTML = '#';
    
    return item;
}

function save (values) {
    var self = this;
    var item = createFilterItem.call(self, values);
    
    // update filter
    if (self.currentEdit) {
        self.domRefs.list.replaceChild(item, self.currentEdit);
        self.currentEdit = null;
    // add new filter
    } else {
        self.domRefs.list.appendChild(item);
    }
}

function remove (li) {
    var self = this;
    
    if (li || self.currentEdit) {
        self.domRefs.list.removeChild(li || self.currentEdit);
        
        if (self.currentEdit) {
            self.currentEdit = null;
        }
    }
}

exports.save = save;
exports.remove = remove;

return module; });