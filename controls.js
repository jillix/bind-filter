var list = require('./list');
var find = require('./find');

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


/*
// add events
if (uiHandlers[name]) {
    self.ui[name].addEventListener(self.config.events[name], (function (name) {
        return function () {
            uiHandlers[name].call(self);
        };
    })(name), false);
}
*/

function init () {
    var self = this;
    console.log(self.config);
}

module.exports = init;
