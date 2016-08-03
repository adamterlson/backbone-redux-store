import Backbone from 'backbone';
import { bbDispatch } from './lib';

const CounterView = Backbone.View.extend({
    initialize() {
        this.listenTo(this.model, 'all', this.render);
        this.listenTo(this.collection, 'all', this.render);
    },

    events: {
        'click .js-increment': 'onIncrementClick',
        'click .js-decrement': 'onDecrementClick',
        'click .js-push': 'onPushClick',
        'click .js-pop': 'onPopClick'
    },

    render() {
        this.$el.html(`
            <h1>Backbone ${this.model.get('num')}</h1>
            <h2>Collection length: ${this.collection.length}</h2>
            <button class="js-increment">+</button>
            <button class="js-decrement">-</button>
            <button class="js-push">push</button>
            <button class="js-pop">pop</button>
        `);
    },

    onIncrementClick() {
        bbDispatch(this.model, 'INCREMENT');
    },

    onDecrementClick() {
        bbDispatch(this.model, 'DECREMENT');
    },

    onPushClick() {
        bbDispatch(this.collection, 'PUSH', {});
    },

    onPopClick() {
        bbDispatch(this.collection, 'POP');
    }
});

export default CounterView;
