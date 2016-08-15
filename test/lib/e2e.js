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
    },
});

describe('e2e communication', () => {
    let called;
    let incrementModel;
    let growingCollection;
    let store;

    describe('without redux', () => {
        beforeEach(() => {
            called = 0;
            incrementModel = new IncrementingModel({ num: 3 });
            store = bbCreateStore()(incrementModel);
            store.subscribe(() => called++);
        });

        describe('backbone -> store', () => {
            it('should affect store change via bbDispatch', () => {
                bbDispatch(incrementModel, 'INCREMENT');

                assert.equal(incrementModel.get('num'), 4);
                assert.equal(called, 1);
            });
        });

        describe('store -> backbone', () => {
            it('should affect model change via store.dispatch', () => {
                store.dispatch({ type: 'INCREMENT' });

                assert.equal(incrementModel.get('num'), 4);
                assert.equal(called, 1);
            });
        });
    });

    describe('without redux', () => {
        beforeEach(() => {
            called = 0;
            incrementModel = new IncrementingModel({ num: 3 });
            store = bbCreateStore(createStore)(incrementModel);
            store.subscribe(() => called++);
        });

        describe('backbone -> store', () => {
            it('should affect store change via bbDispatch', () => {
                bbDispatch(incrementModel, 'INCREMENT');

                assert.equal(incrementModel.get('num'), 4);
                assert.equal(called, 1);
            });
        });

        describe('store -> backbone', () => {
            it('should affect model change via store.dispatch', () => {
                store.dispatch({ type: 'INCREMENT' });

                assert.equal(incrementModel.get('num'), 4);
                assert.equal(called, 1);
            });
        });
    });
});
