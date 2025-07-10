// App.js
import { useReducer } from "react"
import DigitButton from "./DigitButton"
import OperationButton from "./OperationButton"
import "./styles.css"

// Action types for calculator operations
export const ACTIONS = {
  ADD_DIGIT: "add-digit",
  CHOOSE_OPERATION: "choose-operation",
  CLEAR: "clear",
  DELETE_DIGIT: "delete-digit",
  EVALUATE: "evaluate",
}

// Reducer function to manage calculator state transitions
function reducer(state, { type, payload }) {
  switch (type) {
    case ACTIONS.ADD_DIGIT:
      // Add digit or decimal point to the current operand
      // If overwrite flag is set, replace the current operand
      if (state.overwrite) {
        return {
          ...state,
          currentOperand: payload.digit,
          overwrite: false,
        }
      }
      // Prevent multiple leading zeros 
      if (payload.digit === "0" && state.currentOperand === "0") {
        return state
      }
      // Prevent more than one decimal point
      if (payload.digit === "." && state.currentOperand?.includes(".")) {
        return state
      }

      return {
        ...state,
        currentOperand: `${state.currentOperand || ""}${payload.digit}`,
      }

    case ACTIONS.CHOOSE_OPERATION:
      // Set or update the selected operation
      // If no operands present, do nothing
      if (state.currentOperand == null && state.previousOperand == null) {
        return state
      }
      // Change operation if only previous operand exists
      if (state.currentOperand == null) {
        return {
          ...state,
          operation: payload.operation,
        }
      }
      // State changes to null when operator is selected and previous state changes to current State
      if (state.previousOperand == null) {
        return {
          ...state,
          operation: payload.operation,
          previousOperand: state.currentOperand,
          currentOperand: null,
        }
      }
      // Compute existing expression and previous state changes to the evaluate result
      return {
        ...state,
        previousOperand: evaluate(state),
        operation: payload.operation,
        currentOperand: null,
      }

    case ACTIONS.CLEAR:
      // Reset all state to initial empty values
      return {}

    case ACTIONS.DELETE_DIGIT:
      // Delete last digit or clear on overwrite
      if (state.overwrite) {
        return {
          ...state,
          overwrite: false,
          currentOperand: null,
        }
      }
      if (state.currentOperand == null) return state
      // Remove the last character, or clear if only one remains
      if (state.currentOperand.length === 1) {
        return { ...state, currentOperand: null }
      }
      return {
        ...state,
        currentOperand: state.currentOperand.slice(0, -1),
      }

    case ACTIONS.EVALUATE:
      // Evaluate the expression when '=' is pressed 
      if (
        state.operation == null ||
        state.currentOperand == null ||
        state.previousOperand == null
      ) {
        return state
      }
      return {
        ...state,
        overwrite: true,
        previousOperand: null,
        operation: null,
        currentOperand: evaluate(state),
      }

    default:
      return state
  }
}

// Helper to perform arithmetic based on current operation
function evaluate({ currentOperand, previousOperand, operation }) {
  const prev = parseFloat(previousOperand)
  const current = parseFloat(currentOperand)
  if (isNaN(prev) || isNaN(current)) return ""
  let computation = ""
  switch (operation) {
    case "+":
      computation = prev + current
      break
    case "-":
      computation = prev - current
      break
    case "*":
      computation = prev * current
      break
    case "÷":
      computation = prev / current
      break
  }
  return computation.toString()
}

// Format numbers with commas for integer part
const INTEGER_FORMATTER = new Intl.NumberFormat("en-us", {
  maximumFractionDigits: 0,
})

function formatOperand(operand) {
  if (operand == null) return
  const [integer, decimal] = operand.split(".")
  if (decimal == null) return INTEGER_FORMATTER.format(integer)
  return `${INTEGER_FORMATTER.format(integer)}.${decimal}`
}

// Main App component rendering calculator UI
function App() {
  const [{ currentOperand, previousOperand, operation }, dispatch] = useReducer(
    reducer,
    {}
  )

  return (
    <div className="calculator-grid">
      {/* display */}
      <div className="output">
        <div className="previous-operand">
          {formatOperand(previousOperand)} {operation}
        </div>
        <div className="current-operand">{formatOperand(currentOperand)}</div>
      </div>

      {/* row 1 */}
      <button onClick={() => dispatch({ type: ACTIONS.CLEAR })}>
        AC
      </button>
      <button onClick={() => dispatch({ type: ACTIONS.DELETE_DIGIT })}>
        DEL
      </button>
      <button
        onClick={() =>
          dispatch({ type: ACTIONS.ADD_DIGIT, payload: { digit: "(" } })
        }
      >
        (
      </button>
      <button
        onClick={() =>
          dispatch({ type: ACTIONS.ADD_DIGIT, payload: { digit: ")" } })
        }
      >
        )
      </button>

      {/* row 2 */}
      <DigitButton digit="7" dispatch={dispatch} />
      <DigitButton digit="8" dispatch={dispatch} />
      <DigitButton digit="9" dispatch={dispatch} />
      <OperationButton operation="÷" dispatch={dispatch} />

      {/* row 3 */}
      <DigitButton digit="4" dispatch={dispatch} />
      <DigitButton digit="5" dispatch={dispatch} />
      <DigitButton digit="6" dispatch={dispatch} />
      <OperationButton operation="*" dispatch={dispatch} />

      {/* row 4 */}
      <DigitButton digit="1" dispatch={dispatch} />
      <DigitButton digit="2" dispatch={dispatch} />
      <DigitButton digit="3" dispatch={dispatch} />
      <OperationButton operation="-" dispatch={dispatch} />

      {/* row 5 */}
      <DigitButton digit="0" dispatch={dispatch} />
      <DigitButton digit="." dispatch={dispatch} />
      <button onClick={() => dispatch({ type: ACTIONS.EVALUATE })}>=</button>
      <OperationButton operation="+" dispatch={dispatch} />
    </div>
  )
}

export default App
