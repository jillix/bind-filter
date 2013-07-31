function handleMessage (type, msg) {
    var self = this;

    switch (type) {
        case 'error':
            break;
        case '':
            break;
    }
}

function init () {
    var self = this;

    // listen
    self.on('error', handleMessage);
}

module.exports = init;
