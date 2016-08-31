/* eslint-env node, mocha */
// eslint-disable-next-line
import expect from 'expect';

/* eslint-disable import/no-extraneous-dependencies */
import Backbone from 'backbone';
import { createStore, combineReducers } from 'redux';
/* eslint-enable import/no-extraneous-dependencies */

import assert from 'assert';
import { bbDispatch, bbCreateStore } from '../../lib';

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
const incrementingModelReducer = (model = new IncrementingModel(), action) => {
    if (action.type === 'INCREMENT') {
        model.set('num', model.get('num') + 1);
    }
    return model;
};
const growingCollectionReducer = (collection = new GrowingCollection(), action) => {
    if (action.type === 'PUSH') {
        collection.push(action.payload);
    }
    return collection;
};

describe('e2e communication', () => {
    let listenerCalledCount;
    let incrementingModel;
    let growingCollection;
    let store;

    describe('error scenarios', () => {
        it('throws if reducer not passed', () => {
            expect(() => bbCreateStore()())
                .toThrow('bbCreateStore()(reducer[, defaultState]) - Must define a reducer.');
        });

        it('throws if the reducer returns an entity that is not the default state during init', () => {
            const defaultState = new Backbone.Model({ defaultStateArg: true });
            const reducer = () => new Backbone.Collection([]);

            expect(() => bbCreateStore()(reducer, defaultState))
                .toThrow('Reducer must return a backbone entity of the same type as the defaultState entity');
        });

        it('throws if the reducer returns an entity that is not the default state at any time', () => {
            const WrongModelType = Backbone.Model.extend({});
            const defaultState = new Backbone.Model({ defaultStateArg: true });
            const reducer = (state, { type }) => {
                if (type === 'BOMB') {
                    return new WrongModelType({ something: 'else' });
                }
                return state;
            };
            const bombingStore = bbCreateStore()(reducer, defaultState);
            expect(() => bombingStore.dispatch({ type: 'BOMB' }))
                .toThrow('Reducer must return a backbone entity of the same type as the defaultState entity');
        });

        it('throws if default state in the reducer is set to some other entity type', () => {
            const CorrectModelType = Backbone.Model.extend({});
            const CorrectCollectionType = Backbone.Collection.extend({});

            const WrongModelType = Backbone.Model.extend({});

            const defaultState = {
                model: new CorrectModelType({ correct: true }),
                collection: new CorrectCollectionType(),
            };

            const modelReducer = () => new WrongModelType({ defaultState: true });
            const collectionReducer = (state = new CorrectCollectionType()) => state;

            expect(() => bbCreateStore()(
                combineReducers({
                    model: modelReducer,
                    collection: collectionReducer,
                }),
                defaultState
            )).toThrow('Reducer must return a backbone entity of the same type as the defaultState entity');
        });

        it('throws if one of the combined reducers returns an invalid entity type', () => {
            const CorrectModelType = Backbone.Model.extend({});
            const WrongModelType = Backbone.Model.extend({});

            const defaultState = {
                model: new CorrectModelType({ correct: true }),
                collection: new Backbone.Collection([]),
            };

            const modelReducer = (state = new Backbone.Model(), { type }) => {
                if (type === 'BOMB') {
                    return new WrongModelType();
                }
                return state;
            };
            const collectionReducer = (state = new Backbone.Collection()) => state;

            const bombingStore = bbCreateStore()(
                combineReducers({
                    model: modelReducer,
                    collection: collectionReducer,
                }),
                defaultState
            );
            expect(() => bombingStore.dispatch({ type: 'BOMB' }))
                .toThrow('Reducer must return a backbone entity of the same type as the defaultState entity');
        });
    });

    describe('bbCreateStore(createStore)(incrementingModelReducer, model)', () => {
        describe('without defaultState, using default args', () => {
            beforeEach(() => {
                listenerCalledCount = 0;
                incrementingModel = new IncrementingModel({ num: 3 });
                const reducer = (state = incrementingModel, action) => {
                    if (action.type === 'INCREMENT') {
                        state.set({ num: state.get('num') + 1 });
                    }
                    return state;
                };
                store = bbCreateStore(createStore)(reducer);
                store.subscribe(() => listenerCalledCount++);
            });

            describe('backbone -> store', () => {
                it('should not affect store change via bbDispatch because of missing defaultState', () => {
                    bbDispatch(incrementingModel, 'INCREMENT');
                    assert.equal(incrementingModel.get('num'), 3);
                    assert.equal(store.getState().num, 3);
                    assert.equal(listenerCalledCount, 0);
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

        describe('with defaultState', () => {
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
