import { createStore, compose, applyMiddleware } from 'redux';
import { bbReducerShim, combineBBEntities, bbStoreEnhancer } from './lib';
import createLogger from 'redux-logger';

const makeShit = (bb) => {
    const reducer = bbReducerShim(bb);
    const enhancer = bbStoreEnhancer(bb);

    const store = createStore(
        reducer,
        {},
        compose(
            applyMiddleware(createLogger()),
            enhancer
        )
    );

    bb.on('__HELLO_ENHANCER__', (action) => store.dispatch(action, { silent: true }));

    return store;
};


// TODO: simplify API usage ?
export default (backboneEntitiesHash) => {
    const bb = combineBBEntities(backboneEntitiesHash);
    return makeShit(bb);
}

