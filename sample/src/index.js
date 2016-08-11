import React from 'react';
import ReactDOM from 'react-dom';

import { Provider } from 'react-redux';
import configureStoreWithoutRedux from './configureStoreWithoutRedux';
import configureStoreWithRedux from './configureStoreWithRedux';

import Counter from './Counter';
import CounterView from './CounterView';
import CounterModel from './CounterModel';
import CounterCollection from './CounterCollection';

/**
 * WITHOUT REDUX
 */

const noReduxModel = new CounterModel({ num: 3 });
const noReduxCollection = new CounterCollection();

// Create your Backbone-backed, redux-compliant store
const storeWithoutRedux = configureStoreWithoutRedux({ model: noReduxModel, collection: noReduxCollection });

// Render Backbone part
const noReduxBBView = new CounterView({ model: noReduxModel, collection: noReduxCollection });
noReduxBBView.render();

document.querySelector('.no-redux .root-bb').appendChild(noReduxBBView.el);

// Render React part
ReactDOM.render(
    <Provider store={storeWithoutRedux}>
        <Counter />
    </Provider>,
    document.querySelector('.no-redux .root-react')
);


/**
 * WITH REDUX
 */

 const withReduxModel = new CounterModel({ num: 5 });
 const withReduxCollection = new CounterCollection();

 // Create your Backbone-backed, redux-compliant store
 const storeWithRedux = configureStoreWithRedux({ model: withReduxModel, collection: withReduxCollection });

 // Render Backbone part
 const withReduxBBView = new CounterView({ model: withReduxModel, collection: withReduxCollection });
 withReduxBBView.render();

 document.querySelector('.with-redux .root-bb').appendChild(withReduxBBView.el);

 // Render React part
 ReactDOM.render(
     <Provider store={storeWithRedux}>
         <Counter />
     </Provider>,
     document.querySelector('.with-redux .root-react')
 );
