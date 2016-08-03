import React from 'react';
import ReactDOM from 'react-dom';

import { Provider } from 'react-redux';
import configureStore from './configureStore';

import Counter from './Counter';
import CounterView from './CounterView';
import CounterModel from './CounterModel';
import CounterCollection from './CounterCollection';

const myModel = new CounterModel({ num: 3 });
const myCollection = new CounterCollection();

// Create your Backbone-backed, redux-compliant store
const store = configureStore({ myModel, myCollection });

// Render Backbone part
const bbView = new CounterView({ model: myModel, collection: myCollection });
bbView.render();
document.getElementById('bbroot').appendChild(bbView.el);

// Render React part
ReactDOM.render(
    <Provider store={store}>
        <Counter />
    </Provider>,
    document.getElementById('root')
);
