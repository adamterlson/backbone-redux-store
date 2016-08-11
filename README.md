# Backbone Redux Store
[![Build Status](https://travis-ci.org/adamterlson/backbone-redux-store.svg?branch=master)](https://travis-ci.org/adamterlson/backbone-redux-store)

This library is very simple. It provides a redux store API to your backbone models and collections so that they can be used transparently with redux-dependent libraries (e.g. [react-redux](https://github.com/reactjs/react-redux)).

There are no dependencies.

Writen by Vitor Balocco ([@vitorbal](https://github.com/vitorbal)) and Adam Terlson ([@adamterlson](https://github.com/adamterlson)).

## Usage

```javascript
import { bbCreateStore, bbCombineEntities } from 'simple-backbone-redux';

const bbStore = bbCreateStore(bbCombineEntities({
    foo: new FooModel(),
    bar: new BarCollection()
}));
```

You now have a redux-compliant store that you can use as you wish!
