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
