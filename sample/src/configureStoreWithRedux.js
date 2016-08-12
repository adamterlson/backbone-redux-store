import { createStore, applyMiddleware } from 'redux';
import { bbCreateStore } from 'backbone-redux-store';
import createLogger from 'redux-logger';

export default (bb) => {
    const store = bbCreateStore(createStore)(
        bb,
        applyMiddleware(createLogger())
    );

    return store;
}
