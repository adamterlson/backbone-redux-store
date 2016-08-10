/* globals describe it */

import assert from 'assert';
import { createStore, createBBStore } from '../../lib';

describe('createStore()', () => {
    it('returns an object with the store API', () => {
        const store = createStore(() => {}, null);
        assert.strictEqual(typeof store.getState, 'function');
        assert.strictEqual(typeof store.dispatch, 'function');
        assert.strictEqual(typeof store.subscribe, 'function');
    });

    it('returns the enhanced version of the store if enhancer is given', () => {
        const store = {};
        // TODO: Need spies to assert enhancer was called with createStore fn and reducer
        const enhancer = () => () => store;

        assert.strictEqual(createStore(null, null, enhancer), store);
    });

    describe('store API', () => {
        describe('getState()', () => {
            it('invokes the reducer to determine state', () => {
                const state = { a: 'a' };
                const reducer = () => state;
                assert.strictEqual(createStore(reducer).getState(), state);
            });
        });

        describe('dispatch()', () => {
            it('notifies all subscribers', () => {
                let spyCount = 0;
                const listener = () => spyCount++;
                const store = createStore(() => {});

                /* eslint-disable no-underscore-dangle */
                store._listeners.push(listener, listener, listener);
                /* eslint-enable no-underscore-dangle */

                store.dispatch();

                assert.strictEqual(spyCount, 3);
            });
        });

        describe('subscribe()', () => {
            it('adds listener to the list of listeners', () => {
                const listener = () => {};
                const store = createStore(() => {});

                store.subscribe(listener);
                store.subscribe(listener);

                /* eslint-disable no-underscore-dangle */
                assert.strictEqual(store._listeners[0], listener);
                assert.strictEqual(store._listeners[1], listener);
                /* eslint-enable no-underscore-dangle */
            });
        });
    });
});

/** ??? **/
describe('createBBStore()', () => {
});
