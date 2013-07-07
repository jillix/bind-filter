M.wrap('github/jillix/bind-filter/dev/list.js', function (require, module, exports) {

// TODO use bind for dom interaction/manipulation
function elm(d,a){try{var b=document.createElement(d);if("object"===typeof a)for(var c in a)b.setAttribute(c,a[c]);return b}catch(e){return null}}

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
    var checkbox = elm('input', {type: 'checkbox', checked:true});
    
    // enable/disable filter
    checkbox.addEventListener('change', function (event) {
        if (checkbox.checked) {
            enable.call(self, li, values);
        } else {
            disable.call(self, li. values);
        }
    }, false);
    
    onoff.appendChild(checkbox);
    li.appendChild(onoff);
    
    var field = elm('span', {'class':'field'});
    field.innerHTML = values.field;
    field.addEventListener('click', function () {
        edit.call(self, values);
    }, false);
    
    var operator = elm('span', {'class':'operator'});
    operator.innerHTML = values.operator;
    operator.addEventListener('click', function () {
        edit.call(self, values);
    }, false);
    
    var value = elm('span', {'class':'value'});
    value.innerHTML = values.value || '';
    value.addEventListener('click', function () {
        edit.call(self, values);
    }, false);
    
    // remove filter
    var rm = elm('span', {'class':'remove'});
    rm.innerHTML = 'x';
    rm.addEventListener('click', function () {
        remove.call(self, li, values);
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

function save (key, values) {
    var self = this;
    
    // get values
    if (!values) {
        var values = {
            field: self.domRefs.inputs.field.value,
            operator: self.domRefs.inputs.operator.value || '=',
            value: self.domRefs.inputs.value.value
        };
        
        self.domRefs.list.appendChild(createFilterItem.call(self, values));
        return;
    }
    
    // TODO update filter
}

// TODO edit filter
function edit (values) {
    var self = this;
    self.domRefs.filter.style.display = 'block';
    console.log('edit filter');
}

// TODO remove filter
function remove (li) {
    var self = this;
    self.domRefs.list.removeChild(li);
    console.log('remove filter');
}

// TODO enable filter
function enable () {
    var self = this;
    console.log('enable filter');
}

// TODO disable filter
function disable () {
    var self = this;
    console.log('disable filter');
}

exports.save = save;
exports.remove = remove;

return module; });