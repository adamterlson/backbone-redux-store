/**
 * combineBBEntites({
 *   foo: myFooModel,
 *   bar: myBarCollection
 * })
 */

export const bbDispatch = (bb, type, payload) => bb.trigger('__HELLO_ENHANCER__', { type, payload });

export const combineBBEntities = (hash) => {
    const bbThings = Object.keys(hash).map(name => hash[name]);

    const on = (...args) =>
        bbThings.forEach(thing => thing.on(...args));
    const trigger = (...args) =>
        bbThings.forEach(thing => thing.trigger(...args));
    const toJSON = () =>
        Object.keys(hash).reduce(
            (json, name) => Object.assign({}, json, { [name]: hash[name].toJSON() }),
            {}
        );

    return {
        on,
        trigger,
        toJSON
    };
};

export const bbReducerShim = ({ toJSON }) => () => toJSON(); // like a boss

// For usage with redux
export const bbStoreEnhancer = (bb) => (createStore) => (...args) => {
    const store = createStore(...args);
    const dispatch = (action) => {
        bb.trigger(action.type, action.payload);
        store.dispatch(action);
    };

    return {
        ...store,
        dispatch
    };
};
