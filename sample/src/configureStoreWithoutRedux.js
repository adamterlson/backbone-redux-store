import { bbCreateStore } from 'backbone-redux-store';

export default (backboneEntitiesHash) => {
    const store = bbCreateStore()(backboneEntitiesHash);
    return store;
}
