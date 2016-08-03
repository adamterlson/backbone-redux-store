# Simple Backbone Redux

This library is very simple. It provides a redux store API to your backbone models and collections so that they can be used transparently with redux-dependent libraries (e.g. [react-redux](https://github.com/reactjs/react-redux)).

There are no dependencies.

## Usage

```javascript
import { createBBStore, combineBBEntities } from 'simple-backbone-redux';

const bbStore = createBBStore(combineBBEntities({
    foo: new FooModel(),
    bar: new BarCollection()
}));
```

You now have a redux-compliant store that you can use as you wish!
