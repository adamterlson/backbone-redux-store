import React from 'react';
import { connect } from 'react-redux';

const Counter = ({
    modelNum,
    collectionLength,
    onIncrement,
    onDecrement,
    onPush,
    onPop
}) => (
    <div>
        <h2>React Component</h2>

        <h3>this.props.modelNum: {modelNum}</h3>
        <button onClick={onIncrement}>+</button>
        <button onClick={onDecrement}>-</button>

        <h3>this.props.collectionLength: {collectionLength}</h3>
        <button onClick={onPush}>Push</button>
        <button onClick={onPop}>Pop</button>
    </div>
);

const onIncrement = () => ({ type: 'INCREMENT' });
const onDecrement = () => ({ type: 'DECREMENT' });
const onPush = () => ({ type: 'PUSH', payload: {} });
const onPop = () => ({ type: 'POP' });

const CounterContainer = connect(
    ({ model, collection }) => {
        return {
            modelNum: model.num,
            collectionLength: collection.length
        }
    },
    { onIncrement, onDecrement, onPush, onPop }
)(Counter);

export default CounterContainer;
