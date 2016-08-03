import Backbone from 'backbone';

const MyCollection = Backbone.Collection.extend({
    initialize() {
    this.listenTo(this, 'PUSH', (entity) => this.push(entity));
    this.listenTo(this, 'POP', () => this.pop());
  }
});

export default MyCollection;
