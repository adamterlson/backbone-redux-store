/* eslint-env node, mocha */

/* eslint-disable import/no-extraneous-dependencies */
import Backbone from 'backbone';
import { createStore } from 'redux';
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
        const collectionReducer = collection => ({ type, payload }) => {
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

        beforeEach(() => {
            listenerCalledCount = 0;
            growingCollection = new Backbone.Collection([{}, {}, {}]);
        });

        describe('reducer returning collection', () => {
            beforeEach(() => {
                store = bbCreateStore()(collectionReducer(growingCollection));
                store.subscribe(() => listenerCalledCount++);
            });

            describe('state changes happen via', () => {
                it('bbDispatch()', () => {
                    bbDispatch(growingCollection, 'POP');
                    bbDispatch(growingCollection, 'POP');

                    assert.equal(listenerCalledCount, 2);
                    assert.equal(growingCollection.length, 1);
                    assert.equal(store.getState().length, 1);
                });

                it('store.dispatch()', () => {
                    store.dispatch({ type: 'PUSH', payload: { new: true } });

                    assert.equal(growingCollection.last().get('new'), true);
                    assert.equal(listenerCalledCount, 1);
                    assert.equal(growingCollection.length, 4);
                    assert.equal(store.getState().length, 4);
                });

                it('throws if reducer does not return bb entity', () => {
                    assert.throws(
                        () => bbCreateStore()(() => ({})),
                        'bbCreateStore()(bbEntityOrReducer) - Must give a bb entity or a reducer which returns one.'
                    );
                });
            });
        });
    });
});
