const BB_EVENT_NAME = '__HELLO_ENHANCER__';

export const bbDispatch = (bb, type, payload) =>
    bb.trigger(BB_EVENT_NAME, { type, payload });

export const bbCombineEntities = (hash) => {
    // Check if it's already got the BB API, probably by being called with a
    // single BB entity rather than a hash.  If yes, just return it.
    if (hash.on && hash.trigger && hash.toJSON) {
        return hash;
    }
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
        toJSON,
    };
};

export const bbReducer = ({ toJSON }) => () => toJSON(); // like a boss

// For usage with redux
export const bbStoreEnhancer = (bb) => (createStore) => (...args) => {
    const store = createStore(...args);
    const dispatch = (action) => {
        bb.trigger(action.type, action.payload);
        store.dispatch(action);
    };

    return {
        ...store,
        dispatch,
    };
};

// For usage without redux
export const createStore = (reducer, __, enhancer) => {
    if (enhancer) {
        return enhancer(createStore)(reducer);
    }

    let listeners = [];

    const notifyAllListeners = () => listeners.forEach(listener => listener());

    const getState = () => reducer();

    const dispatch = () => notifyAllListeners();

    const subscribe = (listener) => {
        listeners.push(listener);
        return () => {
            listeners = listeners.filter(l => l !== listener);
            return listeners;
        };
    };

    dispatch();

    return {
        _listeners: listeners,
        getState,
        dispatch,
        subscribe,
    };
};

const noop = arg => arg;

export const bbCreateStore = (storeCreator) => (bbEntities, enhancer = noop) => {
    const makeStore = storeCreator || createStore;

    const bb = bbCombineEntities(bbEntities);
    const composedEnhancers = (...args) => bbStoreEnhancer(bb)(enhancer(...args));
    const store = makeStore(bbReducer(bb), {}, composedEnhancers);

    bb.on(BB_EVENT_NAME, (action) => store.dispatch(action, { silent: true }));

    return store;
};
