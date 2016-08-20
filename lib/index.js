const noop = arg => arg;

/**
 * The special event name that is emitted from the BB side into the store as a "dispatch".
 */
const BB_COMM_EVENT = '__HELLO_ENHANCER__';
const INIT_BRS_EVENT = '__INIT_BRS__';

/**
 * Takes key/value pairs where the values are Backbone entities and returns an Object that implements an API consistent
 * with that of a singular Backbone entity:
 * - `trigger` will trigger the event on all entities in the hash.
 * - `on` will attach the listener passed to all entities in the hash.
 * - `toJSON` will serialize all entities in the hash to JSON.
 *
 * @param {Object} hash key/value pairs where values are Backbone entities.
 * @returns {Object} object with an API consistent with that of a singular Backbone entity.
 */
export const bbCombineEntities = (hash) => {
    // Check if it's already got the BB API, return it.
    if (hash.on && hash.trigger && hash.toJSON) {
        return hash;
    }

    const bbThings = Object.keys(hash).map(name => hash[name]);

    const on = (...args) => bbThings.forEach(thing => thing.on(...args));
    const trigger = (...args) => bbThings.forEach(thing => thing.trigger(...args));
    const toJSON = () => JSON.parse(JSON.stringify(hash));

    return { on, trigger, toJSON };
};

/**
 * Replace the dispatch function of a Redux store to also trigger the action.type as an event with a payload
 * of action.payload.
 *
 * @param {Object} backboneEntities - Backbone entity or object created by `combinedBBEntities`.
 * @returns {Function} - function that expects a store creator function and returns a store enhancer
 */
export const bbStoreEnhancer = (backboneEntities) => (storeCreator) => (...args) => {
    const store = storeCreator(...args);
    const dispatch = (action) => {
        if (backboneEntities) {
            backboneEntities.trigger(action.type, action.payload);
        }

        store.dispatch(action);
    };

    return {
        ...store,
        dispatch,
    };
};

/**
 * Returns a "reducer" that returns a BB entity if not already passed one.
 * @param {Object} entitiesOrReducer - BB entity or function that returns one.
 * @returns {Object} A reducer function.
 */
export const makeReducer = (entitiesOrReducer) => {
    if (typeof entitiesOrReducer === 'function') {
        return entitiesOrReducer;
    }
    return () => entitiesOrReducer;
};

/**
 * Used only when Redux is unavailable. Creates a Redux-like store, implementing the same API methods.
 * @param {Function} reducer - A reducing function that returns the next state tree, given the current state tree and an
 *                             action to handle.
 * @param {*} initialState - Not implemented.
 * @param {Function} [enhancer] - The store enhancer. You may optionally specify it to enhance the store with
 *                                third-party capabilities such as middleware, time travel, persistence, etc.
 * @returns {Object} Object that implements a Redux-like store API.
 */
export const createStore = (reducer, initialState = {}, enhancer) => {
    if (enhancer) {
        return enhancer(createStore)(reducer);
    }

    let currentState = initialState;
    let listeners = [];

    const notifyAllListeners = (action) => listeners.forEach(listener => listener(action));

    const getState = () => currentState;

    const dispatch = (action) => {
        if (!action) {
            throw new Error('dispatch(action) - action is required');
        }
        if (!action.type) {
            throw new Error('dispatch(action) - action.type is required');
        }

        currentState = reducer(action);
        notifyAllListeners(action);
        return currentState;
    };

    const subscribe = (listener) => {
        listeners.push(listener);
        return () => {
            listeners = listeners.filter(l => l !== listener);
            return listeners;
        };
    };

    dispatch({ type: INIT_BRS_EVENT });

    return {
        _listeners: listeners,
        getState,
        dispatch,
        subscribe,
    };
};

/**
 * Convenience method to quickly create a Redux-like store, optionally using the Redux `createStore()` method.
 * Automatically combines all Backbone entities passed in and creates all the wiring between them and the store.
 *
 * @public
 * @param {Function} [storeCreator] - Function that creates a Redux-like store, implementing the same API methods.
 *                                    In Redux, this is the `createStore` function.
 * @returns {Function} - A function that expects two arguments: an Object of key/value pairs where the values are
 *                       Backbone entities, and an optional store enhancer. Returns a store.
 */
export const bbCreateStore = (storeCreator = createStore) => (bbEntityOrReducer, enhancer = noop) => {
    let bbReturningReducer;
    let combinedBBEntities;
    const passedBBEntity = typeof bbEntityOrReducer !== 'function';

    if (!bbEntityOrReducer) {
        throw new Error('bbCreateStore()(bbEntityOrReducer) - Must give a bb entity or a reducer which returns one.');
    }

    if (passedBBEntity) {
        combinedBBEntities = bbCombineEntities(bbEntityOrReducer);
        bbReturningReducer = makeReducer(combinedBBEntities);
    } else {
        bbReturningReducer = bbEntityOrReducer;
    }

    // Since the reducer defined by the user returns a bb entity and our state is JSON, wrap in another fn which
    // will ensure a JSON result.
    const jsonReturningReducer = (...args) => bbReturningReducer(...args).toJSON();
    const composedEnhancers = (...args) => bbStoreEnhancer(combinedBBEntities)(enhancer(...args));

    const store = storeCreator(jsonReturningReducer, {}, composedEnhancers);

    if (combinedBBEntities) {
        combinedBBEntities.on(BB_COMM_EVENT, (action) => store.dispatch(action, { silent: true }));
    }

    return store;
};

/**
 * Dispatch-like usage, but triggers a special event behind the scenes which is listened to by the store created with
 * the `bbCreateStore` method.
 * This is the communication method from the Backbone world into the React world.
 *
 * @public
 * @param {Object} backboneEntity - the Backbone model or collection instance
 * @param {String} type - type of the dispatched event
 * @param {Object} payload - payload of the dispatched event
 * @returns {void}
 */
export const bbDispatch = (backboneEntity, type, payload) => backboneEntity.trigger(BB_COMM_EVENT, { type, payload });
