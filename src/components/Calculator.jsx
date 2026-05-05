import { useState } from 'react'

function Calculator() {
    const [display, setDisplay] = useState('0')
    const [previous, setPrevious] = useState(null)
    const [operation, setOperation] = useState(null)
    const [waitingForOperand, setWaitingForOperand] = useState(false)

    const handleNumber = (num) => {
        if (waitingForOperand) {
            setDisplay(String(num))
            setWaitingForOperand(false)
        } else {
            setDisplay(display === '0' ? String(num) : display + num)
        }
    }

    const handleOperation = (op) => {
        const inputValue = parseFloat(display)

        if (previous === null) {
            setPrevious(inputValue)
        } else if (operation) {
            const result = calculate(previous, inputValue, operation)
            setDisplay(String(result))
            setPrevious(result)
        }

        setOperation(op)
        setWaitingForOperand(true)
    }

    const calculate = (prev, current, op) => {
        switch (op) {
            case '+':
                return prev + current
            case '-':
                return prev - current
            case '×':
                return prev * current
            case '÷':
                return prev / current
            default:
                return current
        }
    }

    const handleEquals = () => {
        const inputValue = parseFloat(display)

        if (operation && previous !== null) {
            const result = calculate(previous, inputValue, operation)
            setDisplay(String(result))
            setPrevious(null)
            setOperation(null)
            setWaitingForOperand(true)
        }
    }

    const handleClear = () => {
        setDisplay('0')
        setPrevious(null)
        setOperation(null)
        setWaitingForOperand(false)
    }

    const handleDecimal = () => {
        if (waitingForOperand) {
            setDisplay('0.')
            setWaitingForOperand(false)
        } else if (!display.includes('.')) {
            setDisplay(display + '.')
        }
    }

    return (
        <div className="calculator">
            <div className="calc-display">{display}</div>
            <div className="calc-buttons">
                <button onClick={handleClear}>C</button>
                <button onClick={() => handleOperation('÷')}>÷</button>
                <button onClick={() => handleOperation('×')}>×</button>
                <button onClick={() => handleNumber(7)}>7</button>
                <button onClick={() => handleNumber(8)}>8</button>
                <button onClick={() => handleNumber(9)}>9</button>
                <button onClick={() => handleOperation('-')}>−</button>
                <button onClick={() => handleNumber(4)}>4</button>
                <button onClick={() => handleNumber(5)}>5</button>
                <button onClick={() => handleNumber(6)}>6</button>
                <button onClick={() => handleOperation('+')}>+</button>
                <button onClick={() => handleNumber(1)}>1</button>
                <button onClick={() => handleNumber(2)}>2</button>
                <button onClick={() => handleNumber(3)}>3</button>
                <button onClick={handleEquals} className="equals">=</button>
                <button onClick={() => handleNumber(0)} className="zero">0</button>
                <button onClick={handleDecimal}>.</button>
            </div>
        </div>
    )
}

export default Calculator
