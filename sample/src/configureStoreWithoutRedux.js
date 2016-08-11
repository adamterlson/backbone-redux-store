import { bbCreateStore } from './lib';

export default (backboneEntitiesHash) => {
    const store = bbCreateStore()(backboneEntitiesHash);
    return store;
}
