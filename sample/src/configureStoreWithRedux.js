import { createStore, applyMiddleware } from 'redux';
import { bbCreateStore } from './lib';
import createLogger from 'redux-logger';

export default (backboneEntitiesHash) => {
    const store = bbCreateStore(createStore)(
        backboneEntitiesHash, 
        applyMiddleware(createLogger())
    );

    return store;
}
