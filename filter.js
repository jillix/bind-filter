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
    filter: '.filter',
    list: '.filter-list',
    inputs: {
        field: 'select[name=field]',
        operator: 'select[name=operator]',
        value: 'input[name=value]'
    },
    controls: {
        create: 'button[name=create]',
        add: 'button[name=add]',
        cancel: 'button[name=cancel]',
        remove: 'button[name=remove]'
    }
};

// TODO use bind for dom interaction/manipulation
function elm(d,a){try{var b=document.createElement(d);if("object"===typeof a)for(var c in a)b.setAttribute(c,a[c]);return b}catch(e){return null}}
function get(s,c){
    try{return (c||document).querySelector(s);}
    catch (err) {}
}

function initDom () {
    var self = this;
    
    if (!self.config.controls) {
        return console.error('No controls found.');
    }
    
    // get dom refs
    self.domRefs = {};
    self.domRefs.filter = get(self.config.filter, self.dom);
    self.domRefs.list = get(self.config.list, self.dom);
    
    self.domRefs.inputs = {};
    for (var name in self.config.inputs) {
        self.domRefs.inputs[name] = get(self.config.inputs[name], self.dom);
    }
    
    self.domRefs.controls = {};
    for (var name in self.config.controls) {
        self.domRefs.controls[name] = get(self.config.controls[name], self.dom);
    }
    
    console.log(self.domRefs);
    
    // TODO init UI
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