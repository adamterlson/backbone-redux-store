import Backbone from 'backbone';

const MyModel = Backbone.Model.extend({
  initialize() {
    this.listenTo(this, 'INCREMENT', () =>
      this.set('num', this.get('num') + 1));

    this.listenTo(this, 'DECREMENT', () =>
      this.set('num', this.get('num') - 1));
  }
});

export default MyModel;
