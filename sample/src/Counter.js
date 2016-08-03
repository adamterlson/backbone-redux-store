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
        <h1>React {value}</h1>
        <h2>Collection length {length}</h2>
        <button onClick={onIncrement}>+</button>
        <button onClick={onDecrement}>-</button>
        <button onClick={onPush}>Push</button>
        <button onClick={onPop}>Pop</button>
    </div>
);

const onIncrement = () => ({ type: 'INCREMENT' });
const onDecrement = () => ({ type: 'DECREMENT' });
const onPush = () => ({ type: 'PUSH', payload: {} });
const onPop = () => ({ type: 'POP' });

const CounterContainer = connect(
    // TODO: better names for these keys
    ({ model: { num }, collection }) => {
        return {
            value: num,
            length: collection.length
        }
    },
    { onIncrement, onDecrement, onPush, onPop }
)(Counter);

export default CounterContainer;
