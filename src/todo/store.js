var storeFactory = (function () {
    var module = {};
    var observables = [];
    var state;

    function notifyAll() {
        for (let observable of observables) {
            observable();
        }
    }

    function rootReducer(state, action) {
        
    }

    module.getState = function() {
        return new Promise((resolve,reject) => {

        });
    }

    module.dispatch = function storeDispatch(actionType, payload) {

    }

    module.subscribe = function storeSubscribe(callback) {
        observables.push(callback);
    }

    module.unsubscribe = function storeUnsubscribe(callback) {

    }

    return module;
});