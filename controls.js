M.wrap('github/jillix/bind-filter/dev/controls.js', function (require, module, exports) {
var list = require('./list');
var find = require('./find');

var handlers = {
    cancel: function () {
        var self = this;
        self.domRefs.filter.style.display = 'none';
    },
    save: function () {
        var self = this;
        
        // TODO disable ui
        self.domRefs.filter.style.display = 'none';
        
        list.save.call(self);
        
        // call server
        /*find.call(self, function (err) {
            // TODO enable ui
        });*/
    },
    create: function () {
        var self = this;
        
        // TODO reset form
        self.domRefs.filter.style.display = 'block';
    },
    remove: function () {
        var self = this;
        self.domRefs.filter.style.display = 'none';
        list.remove(self);
    }
};

function init () {
    var self = this;
    
    // add events to controls
    for (var handler in handlers) {
        if (self.domRefs.controls[handler]) {
            self.domRefs.controls[handler].addEventListener(self.config.events[handler] || 'click', (function (handler) {
                return function () {
                    handlers[handler].call(self);
                }
            })(handler));
        }
    }
}

exports.init = init;

return module; });