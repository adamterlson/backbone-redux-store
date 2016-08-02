/**
 * combineBBEntites({
 *   foo: myFooModel,
 *   bar: myBarCollection
 * })
 */

export const combineBBEntities = (hash) => {
    const bbThings = Object.keys(hash).map(name => hash[name]);

    const on = (...args) =>
        bbThings.forEach(thing => thing.on(...args));

    const trigger = (...args) =>
        bbThings.forEach(thing => thing.trigger(...args));

    const toJSON = () =>
        Object.keys(hash).reduce(
            (json, name) => Object.assign({}, json, {
                [name]: hash[name].toJSON()
            }), {}
        );

    return {
        on,
        trigger,
        toJSON
    };
}

export const createBBStore = (bb) => {
    let listeners = [];

    const notifyAllListeners = () =>
        listeners.forEach(listener => listener());

    const getState = () => bb.toJSON();

    const dispatch = (action) => {
        bb.trigger(action.type, action.payload);
        notifyAllListeners();
    };

    const subscribe = (listener) => {
        listeners.push(listener);

        return () => listeners = listeners.filter(l => l !== listener);
    };

    dispatch({});

    bb.on('all', notifyAllListeners);

    return {
        getState,
        dispatch,
        subscribe
    };
};
