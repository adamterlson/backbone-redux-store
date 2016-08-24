/* eslint-env node, mocha */
import expect from 'expect';

/* eslint-disable import/no-extraneous-dependencies */
import Backbone from 'backbone';
import { createStore, combineReducers } from 'redux';
/* eslint-enable import/no-extraneous-dependencies */

import assert from 'assert';
import { bbDispatch, bbCreateStore } from '../../lib';

const incrementingModelReducer = (model, action) => {
    console.log('incrementing model reducer', model);
    if (action.type === 'INCREMENT') {
        model.set('num', model.get('num') + 1);
    }
    return model;
};
const growingCollectionReducer = (collection, action) => {
    console.log('collection reducer');
    if (action.type === 'PUSH') {
        collection.push(action.payload);
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
            expect(() => bbCreateStore()())
                .toThrow('bbCreateStore()(reducer, defaultState) - Must define a reducer.');
        });

        it('throws if defaultState is undefined', () => {
            expect(() => bbCreateStore()(() => {}))
                .toThrow('bbCreateStore()(reducer, defaultState) - defaultState is missing.');
        });

        it('throws if reducer returns undefined', () => {
            expect(() => bbCreateStore()(() => undefined, {}))
                .toThrow('Reducer must return the defaultState entity');
        });

        it('throws if the reducer returns an entity that is not the default state during init', () => {
            const defaultState = new Backbone.Model({ defaultStateArg: true });
            const reducer = () => new Backbone.Model({ something: 'else' });

            expect(() => bbCreateStore()(reducer, defaultState))
                .toThrow('Reducer must return the defaultState entity');
        });

        it('throws if the reducer returns an entity that is not the default state at any time', () => {
            const defaultState = new Backbone.Model({ defaultStateArg: true });
            const reducer = (state, { type }) => {
                if (type === 'BOMB') {
                    return new Backbone.Model({ something: 'else' });
                }
                return state;
            };
            const bombingStore = bbCreateStore()(reducer, defaultState);
            expect(() => bombingStore.dispatch({ type: 'BOMB' }))
                .toThrow('Reducer must return the defaultState entity');
        });

        it.only('throws if one of the combined reducers returns an invalid entity', () => {
            const defaultState = {
                model: new Backbone.Model({ defaultStateArg: true }),
                collection: new Backbone.Collection([]),
            };
            const modelReducer = (state = new Backbone.Model(), { type }) => {
                console.log('state', state);
                console.log('type', type);
                if (type === 'BOMB') {
                    return new Backbone.Model();
                }
                return state;
            };
            const collectionReducer = (state = []) => state;

            const bombingStore = bbCreateStore()(
                combineReducers({
                    model: modelReducer,
                    collection: collectionReducer,
                }),
                defaultState
            );
            expect(() => bombingStore.dispatch({ type: 'BOMB' }))
                .toThrow('Reducer must return the defaultState entity');
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
                assert.equal(store.getState().toJSON().num, 4);
                assert.equal(listenerCalledCount, 1);
            });
        });

        describe('store -> backbone', () => {
            it('should affect model change via store.dispatch', () => {
                store.dispatch({ type: 'INCREMENT' });

                assert.equal(incrementingModel.get('num'), 4);
                assert.equal(store.getState().toJSON().num, 4);
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
                assert.equal(store.getState().toJSON().num, 4);
                assert.equal(listenerCalledCount, 1);
            });
        });

        describe('store -> backbone', () => {
            it('should affect model change via store.dispatch', () => {
                store.dispatch({ type: 'INCREMENT' });

                assert.equal(incrementingModel.get('num'), 4);
                assert.equal(store.getState().toJSON().num, 4);
                assert.equal(listenerCalledCount, 1);
            });
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
                assert.equal(store.getState().toJSON().model.num, 4);
                assert.equal(store.getState().toJSON().collection.length, 4);
                assert.equal(listenerCalledCount, 2);
            });
        });

        describe('store -> backbone', () => {
            it('should affect model change via store.dispatch', () => {
                console.log('dispatching stuffs');
                store.dispatch({ type: 'INCREMENT' });
                store.dispatch({ type: 'PUSH', payload: {} });

                assert.equal(incrementingModel.get('num'), 4);
                assert.equal(growingCollection.length, 4);
                console.log('STATE', store.getState());
                assert.equal(store.getState().toJSON().model.num, 4);
                assert.equal(store.getState().toJSON().collection.length, 4);
                assert.equal(listenerCalledCount, 2);
            });
        });
    });
});
