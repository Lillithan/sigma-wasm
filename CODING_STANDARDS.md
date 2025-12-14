# Coding Standards

This document outlines the coding standards and rules enforced in this project.

## TypeScript Rules

### Type Safety
- **NO `any` types** - Always use proper types. If you need a truly unknown type, use `unknown` with proper type guards.
- **NO type casts** - Avoid `as` assertions. Use type guards, discriminated unions, or proper type narrowing instead.
- **NO non-null assertions (`!`)** - Use proper null checks and type guards. Never use the `!` operator.
- **NO user-defined type guards** - TypeScript doesn't verify that your narrowing logic is correct, making them dangerous. Use built-in type guards like `instanceof`, `typeof`, or discriminated unions.

### Timing & Async
- **NO `setTimeout` or `setInterval`** - Use `requestAnimationFrame` or event-driven patterns instead.
- Prefer event-driven architecture over polling.

### Type Design
- **Prefer discriminated unions** over simple union types where appropriate.
- Use proper type narrowing instead of type assertions.

### Code Quality
- **NO unused variables** - All declared variables must be used.
- **NO custom CSS files** - Use existing CSS or utility classes.
- **NO inline CSS** - Keep all styles in separate stylesheet files.
- **NO dynamic imports** - Use static imports only.

## Enforcement

These rules are automatically enforced through:

1. **TypeScript Compiler** - Strict mode with all strict flags enabled
2. **ESLint** - Custom rules in `.eslintrc.json`
3. **Code Review** - Manual review for compliance
4. **CI/CD** - Automated linting in build pipeline

## Examples

### Type Casts

❌ **Bad:**
```typescript
const element = document.getElementById('foo') as HTMLElement;
```

✅ **Good:**
```typescript
const element = document.getElementById('foo');
if (element instanceof HTMLElement) {
  // use element safely
}
```

### Timeouts

❌ **Bad:**
```typescript
setTimeout(() => doSomething(), 100);
```

✅ **Good:**
```typescript
requestAnimationFrame(() => doSomething());
```

### Non-null Assertions

❌ **Bad:**
```typescript
const value = obj!.property;
```

✅ **Good:**
```typescript
if (obj) {
  const value = obj.property;
}
```

### Discriminated Unions

❌ **Bad: Simple union**
```typescript
type Result = string | number;
```

✅ **Good: Discriminated union**
```typescript
type Result = 
  | { type: 'success'; value: string }
  | { type: 'error'; message: string };
```

## Agent Decision Framework

Before implementing any change, plan, or action, agents MUST consider:

1. **Can this be simplified?**
   - Is there a simpler approach?
   - Can we reduce complexity?

2. **Should these changes be generalized?**
   - Is this logic reusable?
   - Should this be a utility function?
   - Will other parts benefit from this?

3. **Does it follow current patterns?**
   - Is this consistent with existing code?
   - Should refactoring be separate from bug fixes?

4. **Is it using existing dependencies?**
   - Are we duplicating functionality?
   - Can we use existing utilities?

5. **Can we use proven libraries?**
   - Should we use lodash or similar?
   - Is there a well-maintained dependency?
   - Will it reduce maintenance burden?

See `.cursorrules` for the complete agent framework.

