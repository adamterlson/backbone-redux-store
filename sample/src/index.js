import React from 'react';
import ReactDOM from 'react-dom';

import { Provider } from 'react-redux';
import configureStore from './configureStore';

import Counter from './Counter';
import CounterView from './CounterView';
import CounterModel from './CounterModel';
import CounterCollection from './CounterCollection';

const model = new CounterModel({ num: 3 });
const collection = new CounterCollection();

const store = configureStore({ model, collection });

// Render Backbone part
const bbView = new CounterView({ model, collection });
bbView.render();

document.getElementById('bbroot').appendChild(bbView.el);


ReactDOM.render(
    <Provider store={store}>
        <Counter />
    </Provider>,
    document.getElementById('root')
);
