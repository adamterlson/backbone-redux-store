/* eslint-env node, mocha */

/* eslint-disable import/no-extraneous-dependencies */
import Backbone from 'backbone';
import { createStore, combineReducers } from 'redux';
/* eslint-enable import/no-extraneous-dependencies */

import assert from 'assert';
import { bbDispatch, bbCreateStore } from '../../lib';

const incrementingModelReducer = (model, action) => {
    if (action.type === 'INCREMENT') {
        model.set('num', model.get('num') - 1);
    }
    return model;
};
const growingCollectionReducer = (collection, action) => {
    if (action.type === 'PUSH') {
        this.push(action.payload);
    }
    return collection;
};
const IncrementingModel = Backbone.Model.extend({
    initialize() {
        this.listenTo(this, 'DECREMENT', () =>
            this.set('num', this.get('num') - 1));
    },
});
const GrowingCollection = Backbone.Collection.extend({
    initialize() {
        this.listenTo(this, 'POP', (obj) => this.pop(obj));
    },
});

describe('e2e communication', () => {
    let listenerCalledCount;
    let incrementingModel;
    let growingCollection;
    let store;

    describe('error scenarios', () => {
        it('throws if reducer not passed', () => {
            assert.throws(
                () => bbCreateStore()(),
                'bbCreateStore()(reducer, bbEntity) - Must define a reducer.'
            );
        });

        it('throws if bbEntity not passed', () => {
            assert.throws(
                () => bbCreateStore()(),
                'bbCreateStore()(reducer, bbEntity) - Must define a bbEntity.'
            );
        });

        it('throws if reducer returns undefined', () => {
            assert.throws(
                () => bbCreateStore()(() => undefined),
                'Reducer must have a return value'
            );
        });
    });

    describe('bbCreateStore(createStore)(incrementingModelReducer, model)', () => {
        beforeEach(() => {
            listenerCalledCount = 0;
            incrementingModel = new IncrementingModel({ num: 3 });
            store = bbCreateStore(createStore)(incrementingModelReducer, incrementingModel);
            store.subscribe(() => listenerCalledCount++);
        });

        describe('backbone -> store', () => {
            it('should affect store change via bbDispatch', () => {
                bbDispatch(incrementingModel, 'INCREMENT');

                assert.equal(incrementingModel.get('num'), 4);
                assert.equal(store.getState().num, 4);
                assert.equal(listenerCalledCount, 1);
            });
        });

        describe('store -> backbone', () => {
            it('should affect model change via store.dispatch', () => {
                store.dispatch({ type: 'INCREMENT' });

                assert.equal(incrementingModel.get('num'), 4);
                assert.equal(store.getState().num, 4);
                assert.equal(listenerCalledCount, 1);
            });
        });
    });

    describe('bbCreateStore()(incrementingModelReducer, model)', () => {
        beforeEach(() => {
            listenerCalledCount = 0;
            incrementingModel = new IncrementingModel({ num: 3 });
            store = bbCreateStore()(incrementingModelReducer, incrementingModel);
            store.subscribe(() => listenerCalledCount++);
        });

        describe('backbone -> store', () => {
            it('should affect store change via bbDispatch', () => {
                bbDispatch(incrementingModel, 'INCREMENT');

                assert.equal(incrementingModel.get('num'), 4);
                assert.equal(store.getState().num, 4);
                assert.equal(listenerCalledCount, 1);
            });
        });

        describe('store -> backbone', () => {
            it('should affect model change via store.dispatch', () => {
                store.dispatch({ type: 'INCREMENT' });

                assert.equal(incrementingModel.get('num'), 4);
                assert.equal(store.getState().num, 4);
                assert.equal(listenerCalledCount, 1);
            });
        });

        it('should be called with the previous state in the next reducer call', () => {
            const prevStateArgs = [];
            const defaultState = { defaultStateArg: true };

            store = bbCreateStore()((state, { type }) => {
                prevStateArgs.push(state);

                switch (type) {
                case 'INCREMENT':
                    return 'incremented';
                case 'DECREMENT':
                    return 'decremented';
                default:
                    return state;
                }
            }, defaultState);

            store.dispatch({ type: 'INCREMENT' });
            store.dispatch({ type: 'DECREMENT' });
            store.dispatch({ type: 'Just push it' });

            assert.deepEqual(prevStateArgs[0], defaultState);
            assert.deepEqual(prevStateArgs[1], defaultState);
            assert.equal(prevStateArgs[2], 'incremented');
            assert.equal(prevStateArgs[3], 'decremented');
        });
    });

    describe('bbCreateStore()(combineReducers({ modelReducer, collectionReducer }), { model, collection })', () => {
        beforeEach(() => {
            const reducer = combineReducers({
                model: incrementingModelReducer,
                collection: growingCollectionReducer,
            });
            listenerCalledCount = 0;
            incrementingModel = new IncrementingModel({ num: 3 });
            growingCollection = new GrowingCollection([{}, {}, {}]);
            store = bbCreateStore()(reducer, { model: incrementingModel, collection: growingCollection });
            store.subscribe(() => listenerCalledCount++);
        });

        describe('backbone -> store', () => {
            it('should affect store change via bbDispatch', () => {
                bbDispatch(incrementingModel, 'INCREMENT');
                bbDispatch(growingCollection, 'PUSH', {});

                assert.equal(incrementingModel.get('num'), 4);
                assert.equal(growingCollection.length, 4);
                assert.equal(store.getState().model.num, 4);
                assert.equal(store.getState().collection.length, 4);
                assert.equal(listenerCalledCount, 2);
            });
        });

        describe('store -> backbone', () => {
            it('should affect model change via store.dispatch', () => {
                store.dispatch({ type: 'INCREMENT' });
                store.dispatch({ type: 'PUSH', payload: {} });

                assert.equal(incrementingModel.get('num'), 4);
                assert.equal(growingCollection.length, 4);
                assert.equal(store.getState().model.num, 4);
                assert.equal(store.getState().collection.length, 4);
                assert.equal(listenerCalledCount, 2);
            });
        });
    });
});
