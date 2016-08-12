import { createStore, applyMiddleware } from 'redux';
import { bbCreateStore } from 'backbone-redux-store';
import createLogger from 'redux-logger';

export default (backboneEntitiesHash) => {
    const store = bbCreateStore(createStore)(
        backboneEntitiesHash,
        applyMiddleware(createLogger())
    );

    return store;
}
