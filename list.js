M.wrap('github/jillix/bind-filter/dev/list.js', function (require, module, exports) {

// TODO use bind for dom interaction/manipulation
function get(s,c){
    try{return (c||document).querySelector(s);}
    catch (err) {}
}

function createFilterItem (hash) {
    var self = this;
    var item = self.domRefs.listItem.cloneNode(true);
    var checkbox = get(self.config.ui.item.onoff, item);
    var field = get(self.config.ui.item.field, item);
    var operator = get(self.config.ui.item.operator, item);
    var value = get(self.config.ui.item.value, item);
    var edit = get(self.config.ui.item.edit, item);
    var rm = get(self.config.ui.item.remove, item);

    // enable/disable filter
    if (self.filters[hash].disabled) {
        item.setAttribute('class', 'disabled');
        checkbox.removeAttribute('checked');
    }

    // hide filter item
    if (self.filters[hash].hidden) {
        item.style.display = 'none';
    }

    // set content
    if (field) {
        field.innerHTML = self.filters[hash].field;
    }
    if (operator) {
        operator.innerHTML = self.filters[hash].operator;
    }
    if (value) {
        value.innerHTML = self.filters[hash].value || '';
    }

    if (!self.filters[hash].fixed) {

        if (checkbox) {
            checkbox.addEventListener('change', function (event) {
                if (checkbox.checked) {
                    self.emit('enableFilter', hash);
                } else {
                    self.emit('disableFilter', hash);
                }
            }, false);
        }

        // edit filter
        if (edit) {
            // hide edit if it's a core field
            if (self.filters[hash].field.indexOf('_') > -1) {
                edit.style.display = 'none';
            } else {
                edit.addEventListener(self.config.ui.events.itemEdit || 'click', function () {
                    self.emit('editFilter', hash);
                }, false);
            }
        }

        // remove filter
        if (rm) {
            rm.addEventListener(self.config.ui.events.itemRemove || 'click', function () {
                self.emit('removeFilter', hash);
            }, false);
        }
    } else {
        // TODO handle attributes with bind
        item.setAttribute('class', 'fixed' + (self.filters[hash].disabled ? ' disabled' : ''));
        if (checkbox) {
            checkbox.setAttribute('disabled', true);
        }
    }

    return item;
}

function save (hash) {
    var self = this;
    
    // create filter item
    var item = createFilterItem.call(self, hash);
    if (self.filters[hash].item) {
        // replace filter
        self.domRefs.list.replaceChild(item, self.filters[hash].item);
        //self.domRefs.list.appendChild(item);
    } else {
        // add new filter
        if (self.domRefs.list) {
            self.domRefs.list.appendChild(item);
        }
    }

    // update cache
    self.filters[hash].item = item;
}

function remove (hash) {
    var self = this;
    
    if (self.filters[hash]) {
        // remove dom element
        self.domRefs.list.removeChild(self.filters[hash].item);

        // remove from cache
        delete self.filters[hash];
    }
}

exports.save = save;
exports.remove = remove;

return module; });
