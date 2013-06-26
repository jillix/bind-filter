/*var = uiConfig = {
    //logic: '#filter [name=logic]',
    field: '#filter [name=field]',
    value: '#filter [name=value]',
    operator: '#filter [name=operator]',
    add: '#filter [name=add]'
}

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

function init () {
    
    var self = this;
    var domRefs = {};
    
    for (var name in uiConfig) {
        var domRef = domRefs[name] = get(uiConfig[name], self.dom);
        
        if (!domRef) {
            throw new Error('Mandatory dom element not found: ' + uiConfig[name]);
        }
    }
    
    domRefs.add.addEventListener('click', function () {
        var query = queryBuilder(domRefs);
        self.emit('find', query, function (err, data) {
            console.dir(err);
            console.dir(data);
        });
    });
}

function elm(d,a){try{var b=document.createElement(d);if("object"===typeof a)for(var c in a)b.setAttribute(c,a[c]);return b}catch(e){return null}}
function get(s,c){return (c||document).querySelector(s)}

module.exports = init;
*/

