/**
 * Safe math expression evaluator
 * Supports: +, -, *, /, parentheses, and decimal numbers
 * Does NOT use eval() for security
 */

type Token = {
  type: 'number' | 'operator' | 'lparen' | 'rparen'
  value: string | number
}

// Tokenize the expression
function tokenize(expr: string): Token[] {
  const tokens: Token[] = []
  let i = 0

  while (i < expr.length) {
    const char = expr[i]

    // Skip whitespace
    if (/\s/.test(char)) {
      i++
      continue
    }

    // Numbers (including decimals)
    if (/[\d.]/.test(char)) {
      let numStr = ''
      while (i < expr.length && /[\d.]/.test(expr[i])) {
        numStr += expr[i]
        i++
      }
      tokens.push({ type: 'number', value: parseFloat(numStr) })
      continue
    }

    // Operators
    if (['+', '-', '*', '/', 'x', 'X'].includes(char)) {
      // Treat 'x' and 'X' as multiplication
      const op = char.toLowerCase() === 'x' ? '*' : char
      tokens.push({ type: 'operator', value: op })
      i++
      continue
    }

    // Parentheses
    if (char === '(') {
      tokens.push({ type: 'lparen', value: '(' })
      i++
      continue
    }

    if (char === ')') {
      tokens.push({ type: 'rparen', value: ')' })
      i++
      continue
    }

    // Unknown character - skip
    i++
  }

  return tokens
}

// Shunting-yard algorithm for parsing to RPN (Reverse Polish Notation)
function toRPN(tokens: Token[]): Token[] {
  const output: Token[] = []
  const operatorStack: Token[] = []

  const precedence: Record<string, number> = {
    '+': 1,
    '-': 1,
    '*': 2,
    '/': 2,
  }

  for (const token of tokens) {
    if (token.type === 'number') {
      output.push(token)
    } else if (token.type === 'operator') {
      while (
        operatorStack.length > 0 &&
        operatorStack[operatorStack.length - 1].type === 'operator' &&
        precedence[operatorStack[operatorStack.length - 1].value as string] >= precedence[token.value as string]
      ) {
        output.push(operatorStack.pop()!)
      }
      operatorStack.push(token)
    } else if (token.type === 'lparen') {
      operatorStack.push(token)
    } else if (token.type === 'rparen') {
      while (
        operatorStack.length > 0 &&
        operatorStack[operatorStack.length - 1].type !== 'lparen'
      ) {
        output.push(operatorStack.pop()!)
      }
      // Pop the left paren
      if (operatorStack.length > 0 && operatorStack[operatorStack.length - 1].type === 'lparen') {
        operatorStack.pop()
      }
    }
  }

  // Pop remaining operators
  while (operatorStack.length > 0) {
    const op = operatorStack.pop()!
    if (op.type !== 'lparen') {
      output.push(op)
    }
  }

  return output
}

// Evaluate RPN expression
function evaluateRPN(rpn: Token[]): number {
  const stack: number[] = []

  for (const token of rpn) {
    if (token.type === 'number') {
      stack.push(token.value as number)
    } else if (token.type === 'operator') {
      if (stack.length < 2) {
        throw new Error('Invalid expression')
      }
      const b = stack.pop()!
      const a = stack.pop()!

      switch (token.value) {
        case '+':
          stack.push(a + b)
          break
        case '-':
          stack.push(a - b)
          break
        case '*':
          stack.push(a * b)
          break
        case '/':
          if (b === 0) {
            throw new Error('Division by zero')
          }
          stack.push(a / b)
          break
      }
    }
  }

  if (stack.length !== 1) {
    throw new Error('Invalid expression')
  }

  return stack[0]
}

/**
 * Safely evaluate a math expression
 * @param expression - Math expression string (e.g., "2+3*4", "10/2", "(5+3)*2")
 * @returns The calculated result or null if invalid
 */
export function evaluateExpression(expression: string): number | null {
  if (!expression || expression.trim() === '') {
    return null
  }

  // If it's just a number, return it
  const trimmed = expression.trim()
  const justNumber = parseFloat(trimmed)
  if (!isNaN(justNumber) && /^-?\d+\.?\d*$/.test(trimmed)) {
    return justNumber
  }

  try {
    const tokens = tokenize(expression)
    if (tokens.length === 0) {
      return null
    }

    // If there's only one number token, return it
    if (tokens.length === 1 && tokens[0].type === 'number') {
      return tokens[0].value as number
    }

    const rpn = toRPN(tokens)
    const result = evaluateRPN(rpn)

    // Round to avoid floating point errors
    return Math.round(result * 1000000) / 1000000
  } catch {
    return null
  }
}

/**
 * Check if a string contains a math expression (has operators)
 */
export function isExpression(value: string): boolean {
  return /[+\-*/xX()]/.test(value) && !/^-?\d+\.?\d*$/.test(value.trim())
}
