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
    var checkbox = elm('input', {type: 'checkbox', checked:true});
    
    // enable/disable filter
    checkbox.addEventListener('change', function (event) {
        if (checkbox.checked) {
            self.emit('enableFilter', li, values);
        } else {
            self.emit('disableFilter', li, values);
        }
    }, false);
    
    onoff.appendChild(checkbox);
    li.appendChild(onoff);
    
    var field = elm('span', {'class':'field'});
    field.innerHTML = values.field;
    field.addEventListener('click', function () {
        self.emit('editFilter', li, values);
    }, false);
    
    var operator = elm('span', {'class':'operator'});
    operator.innerHTML = values.operator;
    operator.addEventListener('click', function () {
        self.emit('editFilter', li, values);
    }, false);
    
    var value = elm('span', {'class':'value'});
    value.innerHTML = values.value || '';
    value.addEventListener('click', function () {
        self.emit('editFilter', li, values);
    }, false);
    
    // remove filter
    var rm = elm('span', {'class':'remove'});
    rm.innerHTML = 'x';
    rm.addEventListener('click', function () {
        self.emit('removeFilter', li, values);
    }, false);
    
    // TODO sort filter (drag'n drop)
    var handler = elm('span', {'class':'handler'});
    handler.innerHTML = '#';
    
    li.appendChild(field);
    li.appendChild(operator);
    li.appendChild(value);
    li.appendChild(rm);
    li.appendChild(handler);
    return li;
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