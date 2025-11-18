# Keeping Components Pure

## Table of Contents
- [Overview](#overview)
- [Why Purity Matters](#why-purity-matters)
- [Idempotency](#idempotency)
- [Side Effects](#side-effects)
- [Mutation Rules](#mutation-rules)
- [Examples](#examples)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Overview
You can think of your React components as describing what you want to see on the screen. When their inputs change, React figures out the new thing to display.

Important: Your components must be pure with respect to their props.

A pure function is a function that:
- Minds its own business. It does not change any objects or variables that existed before it was called.
- Same inputs, same output. Given the same inputs, a pure function should always return the same result.

## Why Purity Matters
By strictly following this rule, you unlock powerful capabilities that you can rely on:
- Your components could run in a different environment—for example, on the server! Since they return the same result for the same inputs, one component can serve many user requests.
- You can improve performance by skipping re-rendering components whose inputs haven't changed. This is safe because pure functions always return the same result, so they are safe to cache.
- If some data changes in the middle of rendering a deep component tree, React can restart rendering without wasting time on completed parts. Purity makes it safe to stop calculating at any point.

## Idempotency
For the same inputs, a component must always return the same JSX. This ensures predictability and allows React to optimize rendering by caching results or skipping unnecessary re-renders.

## Side Effects
Side effects belong in event handlers. Event handlers are functions that React runs when you perform some action—like clicking a button. Even though event handlers are defined inside your component, they don't run during rendering! So event handlers don't need to be pure.

If you exhaust all other options and can't find the right event handler for your side effect, you can still attach it to the returned JSX with a `useEffect` call in your component. This tells React to execute it later, after rendering, when side effects are allowed. However, this approach should be your last resort.

When rendering, React calls your components. Your React components must not cause side effects during rendering.

StrictMode helps find components that break this rule.

## Mutation Rules
Every React component you write must be pure. This means that React components you write must follow these principles:
1. A component must not change its inputs
2. For the same inputs, a component must always return the same JSX

Local mutation is okay if the variables are created during the same render. However, don't mutate objects that aren't fresh, such as props or state.

The rule of thumb is: treat props and state as immutable. When you need to change them, create new versions instead of mutating the existing ones.

## Examples

### Local Mutation (Okay)
```jsx
function ShoppingCart({ products }) {
  const messages = []; // Fresh array
  messages.push('Hello'); // Okay, mutating local variable
  return <div>{messages.join(', ')}</div>;
}
```

### Mutating Props (Not Okay)
```jsx
function ShoppingCart({ products }) {
  products.push(newProduct); // Bad: mutates prop
  return <div>...</div>;
}
```

### Fixing Mutation
```jsx
function ShoppingCart({ products }) {
  const newProducts = [...products]; // Copy first
  newProducts.push(newProduct);
  return <div>...</div>;
}
```

## Best Practices
- Use array methods like `filter()` and `map()` to create new arrays without mutating the original.
- For objects, use the spread syntax to create copies.
- Keep components pure by ensuring they don't mutate inputs and return consistent JSX for the same inputs.
- Place side effects in event handlers or `useEffect` as a last resort.

## Troubleshooting

### Detection of Impure Calculations
During development, React calls each of your components twice in Strict Mode. By calling your components twice, Strict Mode helps find components that break the rules.

Notice how the first call to `console.log` was skipped. The second call worked. But why?

Because in Strict Mode, React calls your component function twice to help detect impure functions. Pure functions produce the same result every time, so React can safely skip the first result and use the second one. If the function is impure, the two calls will produce different results, which violates the purity rule.

In the example, the first `console.log` was skipped because React ignored the result of the first call. The second `console.log` worked because React used the result of the second call, which was the same.

This helps you catch mistakes early.

### Fixing a Component that Mutates Its Inputs
Suppose you have a shopping cart component that displays a list of products and a button to add a new product.

The problem is that `addProduct` mutates the `products` array that was passed as a prop. This breaks the purity rule.

To fix this, you can create a copy of the array before mutating it:

```jsx
function addProduct(products, newProduct) {
  const newProducts = [...products];
  newProducts.push(newProduct);
  return newProducts;
}
```

You can also use array methods that return new arrays, like `concat()`:

```jsx
function addProduct(products, newProduct) {
  return products.concat([newProduct]);
}
```

Or the spread syntax:

```jsx
function addProduct(products, newProduct) {
  return [...products, newProduct];
}
```

Both approaches keep the original `products` array intact, maintaining purity.

In summary, treat props and state as immutable. When you need to change them, create new versions instead of mutating the existing ones.

This ensures your components are pure and predictable.