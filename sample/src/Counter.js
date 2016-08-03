import React from 'react';
import { connect } from 'react-redux';

const Counter = ({
    value,
    length,
    onIncrement,
    onDecrement,
    onPush,
    onPop
}) => (
    <div>
        <h1>React Part</h1>

        <h2>Model num: {value}</h2>
        <button onClick={onIncrement}>+</button>
        <button onClick={onDecrement}>-</button>

        <h2>Collection length: {length}</h2>
        <button onClick={onPush}>Push</button>
        <button onClick={onPop}>Pop</button>
    </div>
);

const onIncrement = () => ({ type: 'INCREMENT' });
const onDecrement = () => ({ type: 'DECREMENT' });
const onPush = () => ({ type: 'PUSH', payload: {} });
const onPop = () => ({ type: 'POP' });

const CounterContainer = connect(
    ({ myModel, myCollection }) => {
        return {
            value: myModel.num,
            length: myCollection.length
        }
    },
    { onIncrement, onDecrement, onPush, onPop }
)(Counter);

export default CounterContainer;
