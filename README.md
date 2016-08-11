# Backbone Redux Store
[![Build Status](https://travis-ci.org/adamterlson/backbone-redux-store.svg?branch=master)](https://travis-ci.org/adamterlson/backbone-redux-store)

This library services apps that are built with both Backbone and React and want to make the React world talk to the Backbone world. It allows for seamless state syncing between React components and Backbone views, where the state's source of truth are your existing Backbone models and collections, but the API is redux.

* Expose Backbone-backed state to your React components via libraries like [react-redux](https://github.com/reactjs/react-redux) so they never have to (messily) know about Backbone and can be future-proofed for Redux
* Redux itself is an **optional** dependency, if you want to leverage it elsewhere in your application already.
* Import redux and use redux's `applyMiddleware` function to add middleware and store enhancers written for redux (e.g. [redux-logger](https://github.com/evgenyrodionov/redux-logger)) *even on your Backbone-backed store*.

Backbone Redux Store has no dependencies.

Writen by Vitor Balocco ([@vitorbal](https://github.com/vitorbal)) and Adam Terlson ([@adamterlson](https://github.com/adamterlson)).

See [Justification](#justification) section for more.


### Usage - Without Redux

Want to write React components to be future-proof for when they all operate on a central redux store, but in the interim need to leverage Backbone models and collections without taking Redux as a dependency?  

No problem!

```javascript
import { bbCreateStore } from 'backbone-redux-store';

import FooModel from './models/Foo';
import BarCollection from './collections/Bar';

const configureStoreWithoutMiddleware = (bb) => bbCreateStore()(bb);

// In your components:

const myStoreData = {
    foo: new FooModel(),
    bar: new BarCollection()
};

const store = configureStoreWithoutMiddleware(myStoreData);
```

You now have a redux-compliant store that you can use as you wish!  You can pass it into the `<Provider>` component exported by react-redux, or subscribe to it directly.


### Usage - With Redux (and middleware)

Adding redux means that you can now use its `applyMiddleware` function to add any middleware you wish to the backbone-backed state store.

```javascript
import { bbCreateStore } from 'backbone-redux-store';

import { createStore, applyMiddleware } from 'redux';
import createLogger from 'redux-logger';

const configureStoreWithMiddleware = (bb) => bbCreateStore(createStore)(
    bb,
    applyMiddleware(createLogger())
);

// In your components:

const myStoreData = {
    foo: new FooModel(),
    bar: new BarCollection()
};

const store = configureStoreWithMiddleware(myStoreData);
```

## Justification

You are here:
* Presentation: Backbone
* State: Backbone

You want to be here:
* Presentation: React
* State: Redux

This transition can be difficult, often accomplished by drawing a hard line in the sand. But this means rewriting existing state logic and/or components.  

This library makes a lovely middle ground possible:

* Presentation: Backbone and React
* State: Backbone and Redux (optional)

However, **React doesn't need to know Backbone exists**, so you can leverage both technologies without complicating your path forward or affecting the reusability of your React components.

## Migration Strategy

TODO: Show the path from only backbone to only redux.
