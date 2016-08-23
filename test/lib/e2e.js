/* eslint-env node, mocha */

/* eslint-disable import/no-extraneous-dependencies */
import Backbone from 'backbone';
import { createStore, combineReducers } from 'redux';
/* eslint-enable import/no-extraneous-dependencies */

import assert from 'assert';
import { bbDispatch, bbCreateStore } from '../../lib';

const IncrementingModel = Backbone.Model.extend({
    initialize() {
        this.listenTo(this, 'INCREMENT', () =>
            this.set('num', this.get('num') + 1));
        this.listenTo(this, 'DECREMENT', () =>
            this.set('num', this.get('num') - 1));
    },
});
const GrowingCollection = Backbone.Collection.extend({
    initialize() {
        this.listenTo(this, 'PUSH', (obj) => this.push(obj));
        this.listenTo(this, 'POP', (obj) => this.pop(obj));
    },
});

describe('e2e communication', () => {
    let listenerCalledCount;
    let incrementingModel;
    let growingCollection;
    let store;

    describe('bbCreateStore()(model)', () => {
        beforeEach(() => {
            listenerCalledCount = 0;
            incrementingModel = new IncrementingModel({ num: 3 });
            store = bbCreateStore()(incrementingModel);
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

    describe('bbCreateStore()({ model, collection })', () => {
        beforeEach(() => {
            listenerCalledCount = 0;
            incrementingModel = new IncrementingModel({ num: 3 });
            growingCollection = new GrowingCollection([{}, {}, {}]);
            store = bbCreateStore()({ model: incrementingModel, collection: growingCollection });
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
                store.dispatch({ type: 'DECREMENT' });
                store.dispatch({ type: 'POP' });

                assert.equal(incrementingModel.get('num'), 2);
                assert.equal(growingCollection.length, 2);
                assert.equal(store.getState().model.num, 2);
                assert.equal(store.getState().collection.length, 2);
                assert.equal(listenerCalledCount, 2);
            });
        });
    });

    describe('bbCreateStore(createStore)(model)', () => {
        beforeEach(() => {
            listenerCalledCount = 0;
            incrementingModel = new IncrementingModel({ num: 3 });
            store = bbCreateStore(createStore)(incrementingModel);
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

    describe('bbCreateStore()(reducer)', () => {
        const collectionReducer = collection => (state, { type, payload }) => {
            switch (type) {
            case 'PUSH':
                collection.push(payload);
                return collection;
            case 'POP':
                collection.pop();
                return collection;
            default:
                return collection;
            }
        };

        const modelReducer = model => (state, { type, payload }) => {
            switch (type) {
            case 'INCREMENT':
                model.set({ num: model.get('num') + 1 });
                return model;
            case 'DECREMENT':
                model.set({ num: model.get('num') - 1 });
                return model;
            default:
                return model;
            }
        };

        beforeEach(() => {
            listenerCalledCount = 0;
            growingCollection = new Backbone.Collection([{}, {}, {}]);
            incrementingModel = new Backbone.Model({ num: 3 });
        });

        describe('reducer returning collection', () => {
            beforeEach(() => {
                store = bbCreateStore()(collectionReducer(growingCollection));
                store.subscribe(() => listenerCalledCount++);
            });

            it('throws if reducer or bbEntity not passed', () => {
                assert.throws(
                    () => bbCreateStore()(),
                    'bbCreateStore()(bbEntityOrReducer) - Must give a bb entity or a reducer which returns one.'
                );
            });

            it('throws if reducer returns undefined', () => {
                assert.throws(
                    () => bbCreateStore()(() => undefined),
                    'Reducer must have a return value'
                );
            });

            it('should not change state via bbDispatch()', () => {
                bbDispatch(growingCollection, 'POP');
                assert.equal(listenerCalledCount, 0);
                assert.equal(growingCollection.length, 3);
                assert.equal(store.getState().length, 3);
            });

            it('should change state via store.dispatch()', () => {
                store.dispatch({ type: 'PUSH', payload: { new: true } });

                assert.equal(growingCollection.last().get('new'), true);
                assert.equal(listenerCalledCount, 1);
                assert.equal(growingCollection.length, 4);
                assert.equal(store.getState().length, 4);
            });

            it('should be called with the previous state in the next reducer call', () => {
                const prevStateArgs = [];
                const defaultState = { defaultStateArg: true };

                store = bbCreateStore()((state, { type }) => {
                    prevStateArgs.push(state);

                    switch(type) {
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

        describe('multiple reducers with combineReducer', () => {
            beforeEach(() => {
                store = bbCreateStore()(combineReducers({
                    collection: collectionReducer(growingCollection),
                    model: modelReducer(incrementingModel),
                }));
                store.subscribe(() => listenerCalledCount++);
            });

            it('should change the collection and model state via store.dispatch()', () => {
                store.dispatch({ type: 'PUSH', payload: { new: true } });
                store.dispatch({ type: 'INCREMENT' });

                assert.equal(growingCollection.last().get('new'), true);
                assert.equal(incrementingModel.get('num'), 4);
                assert.equal(listenerCalledCount, 2);
                assert.equal(growingCollection.length, 4);
                assert.equal(store.getState().collection.length, 4);
                assert.equal(store.getState().model.num, 4);
            });
        });
    });
});
