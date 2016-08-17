/* eslint-env node, mocha */

import assert from 'assert';
import { createStore } from '../../lib';

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
            let spyCount = 0;
            let listener;
            let store;

            beforeEach(() => {
                listener = () => spyCount++;
                store = createStore(() => {});
            });

            it('notifies all subscribers', () => {
                /* eslint-disable no-underscore-dangle */
                store._listeners.push(listener, listener, listener);
                /* eslint-enable no-underscore-dangle */

                store.dispatch({ type: 'SOMETHING' });

                assert.strictEqual(spyCount, 3);
            });

            it('throws if called without action', () => {
                assert.throws(() => store.dispatch(), 'dispatch(action) - action is required');
            });

            it('throws if called without action.type', () => {
                assert.throws(() => store.dispatch(), 'dispatch(action) - action is required');
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
describe('bbCreateStore()', () => {
});
