# Functional Programming Style Guide

## 🎯 Core Principles

This project follows **pure functional programming** principles in both Rust and TypeScript.

---

## ✅ Rules

### 1. **Pure Functions Only**
Functions should have no side effects and always return the same output for the same input.

#### ❌ Bad (Impure):
```typescript
let count = 0;
function increment() {
  count++;  // Side effect!
  return count;
}
```

#### ✅ Good (Pure):
```typescript
function increment(count: number): number {
  return count + 1;
}
```

#### ❌ Bad (Rust - Mutable):
```rust
fn increment(count: &mut i32) {
    *count += 1;  // Mutation!
}
```

#### ✅ Good (Rust - Immutable):
```rust
fn increment(count: i32) -> i32 {
    count + 1
}
```

---

### 2. **Immutable Data Structures**

#### TypeScript:
```typescript
// ❌ Bad - Mutation
const user = { name: "John", age: 30 };
user.age = 31;  // Mutation!

// ✅ Good - Immutable
const user = { name: "John", age: 30 };
const updatedUser = { ...user, age: 31 };

// ❌ Bad - Array mutation
const items = [1, 2, 3];
items.push(4);  // Mutation!

// ✅ Good - Immutable
const items = [1, 2, 3];
const newItems = [...items, 4];
```

#### Rust:
```rust
// ❌ Bad - Mutable
let mut user = User { name: "John".to_string(), age: 30 };
user.age = 31;  // Mutation!

// ✅ Good - Immutable
let user = User { name: "John".to_string(), age: 30 };
let updated_user = User { age: 31, ..user };

// ❌ Bad - Vec mutation
let mut items = vec![1, 2, 3];
items.push(4);  // Mutation!

// ✅ Good - Immutable
let items = vec![1, 2, 3];
let new_items = items.into_iter().chain(vec![4]).collect();
```

---

### 3. **Explicit Error Handling**

#### TypeScript - Result Pattern:
```typescript
// Define Result type
type Result<T, E = Error> = 
  | { ok: true; value: T }
  | { ok: false; error: E };

// ❌ Bad - Throwing exceptions
function divide(a: number, b: number): number {
  if (b === 0) throw new Error("Division by zero");
  return a / b;
}

// ✅ Good - Explicit Result
function divide(a: number, b: number): Result<number> {
  if (b === 0) {
    return { ok: false, error: new Error("Division by zero") };
  }
  return { ok: true, value: a / b };
}

// Usage
const result = divide(10, 2);
if (result.ok) {
  console.log(result.value);  // 5
} else {
  console.error(result.error);
}
```

#### Rust - Result Type:
```rust
// ❌ Bad - Panic
fn divide(a: f64, b: f64) -> f64 {
    if b == 0.0 {
        panic!("Division by zero");
    }
    a / b
}

// ✅ Good - Result
fn divide(a: f64, b: f64) -> Result<f64, String> {
    if b == 0.0 {
        return Err("Division by zero".to_string());
    }
    Ok(a / b)
}

// Usage
match divide(10.0, 2.0) {
    Ok(result) => println!("{}", result),
    Err(e) => eprintln!("Error: {}", e),
}
```

---

### 4. **Composition Over Inheritance**

#### TypeScript:
```typescript
// ❌ Bad - Class-based OOP
class Animal {
  name: string;
  constructor(name: string) {
    this.name = name;
  }
  speak() {
    return "Some sound";
  }
}
class Dog extends Animal {
  speak() {
    return "Woof!";
  }
}

// ✅ Good - Function composition
type Animal = {
  name: string;
};

const createAnimal = (name: string): Animal => ({ name });

const withSpeech = <T extends Animal>(animal: T, sound: string) => ({
  ...animal,
  speak: () => sound,
});

const dog = withSpeech(createAnimal("Buddy"), "Woof!");
console.log(dog.speak());  // "Woof!"
```

#### Rust:
```rust
// ❌ Bad - Trait inheritance (avoid when possible)
trait Animal {
    fn speak(&self) -> String;
}

struct Dog {
    name: String,
}

impl Animal for Dog {
    fn speak(&self) -> String {
        "Woof!".to_string()
    }
}

// ✅ Good - Function composition
#[derive(Clone)]
struct Animal {
    name: String,
}

fn create_animal(name: String) -> Animal {
    Animal { name }
}

fn with_speech(animal: Animal, sound: String) -> impl Fn() -> String {
    move || sound.clone()
}

let animal = create_animal("Buddy".to_string());
let speak = with_speech(animal, "Woof!".to_string());
println!("{}", speak());  // "Woof!"
```

---

### 5. **Higher-Order Functions**

#### TypeScript:
```typescript
// ✅ map, filter, reduce instead of loops
const numbers = [1, 2, 3, 4, 5];

// ❌ Bad - Imperative loop
const doubled = [];
for (let i = 0; i < numbers.length; i++) {
  doubled.push(numbers[i] * 2);
}

// ✅ Good - Functional
const doubled = numbers.map(n => n * 2);
const evens = numbers.filter(n => n % 2 === 0);
const sum = numbers.reduce((acc, n) => acc + n, 0);

// ✅ Function composition
const pipe = <T>(...fns: Array<(arg: T) => T>) => (value: T) =>
  fns.reduce((acc, fn) => fn(acc), value);

const transform = pipe(
  (n: number) => n * 2,
  (n: number) => n + 1,
  (n: number) => n.toString()
);

console.log(transform(5));  // "11"
```

#### Rust:
```rust
// ✅ Iterators instead of loops
let numbers = vec![1, 2, 3, 4, 5];

// ❌ Bad - Mutable loop
let mut doubled = Vec::new();
for n in &numbers {
    doubled.push(n * 2);
}

// ✅ Good - Functional
let doubled: Vec<i32> = numbers.iter().map(|n| n * 2).collect();
let evens: Vec<i32> = numbers.iter().filter(|n| *n % 2 == 0).copied().collect();
let sum: i32 = numbers.iter().sum();

// ✅ Function composition
fn pipe<T, U, V, F, G>(f: F, g: G) -> impl Fn(T) -> V
where
    F: Fn(T) -> U,
    G: Fn(U) -> V,
{
    move |x| g(f(x))
}

let transform = pipe(
    |n: i32| n * 2,
    pipe(
        |n: i32| n + 1,
        |n: i32| n.to_string(),
    ),
);

println!("{}", transform(5));  // "11"
```

---

### 6. **No Null/Undefined**

#### TypeScript - Option Pattern:
```typescript
// Define Option type
type Option<T> = { some: T } | { none: true };

const Some = <T>(value: T): Option<T> => ({ some: value });
const None = <T>(): Option<T> => ({ none: true });

// ❌ Bad - Nullable
function findUser(id: number): User | null {
  return users.find(u => u.id === id) || null;
}

const user = findUser(1);
if (user !== null) {  // Null check required everywhere!
  console.log(user.name);
}

// ✅ Good - Option
function findUser(id: number): Option<User> {
  const user = users.find(u => u.id === id);
  return user ? Some(user) : None();
}

const user = findUser(1);
if ('some' in user) {
  console.log(user.some.name);
}
```

#### Rust - Option Type:
```rust
// ❌ Bad - Using null (doesn't exist in Rust!)
// Rust doesn't have null, so this doesn't apply

// ✅ Good - Option
fn find_user(id: i32) -> Option<User> {
    users.iter().find(|u| u.id == id).cloned()
}

match find_user(1) {
    Some(user) => println!("{}", user.name),
    None => println!("User not found"),
}

// Or using if-let
if let Some(user) = find_user(1) {
    println!("{}", user.name);
}
```

---

### 7. **Avoid Side Effects**

#### TypeScript:
```typescript
// ❌ Bad - Side effects
function processUser(user: User) {
  console.log("Processing user...");  // Side effect!
  fetch('/api/users', { method: 'POST', body: JSON.stringify(user) });  // Side effect!
  localStorage.setItem('lastUser', user.id);  // Side effect!
  return user.name.toUpperCase();
}

// ✅ Good - Separate pure logic from effects
function transformUser(user: User): string {
  return user.name.toUpperCase();  // Pure!
}

async function saveUser(user: User): Promise<void> {
  // Effects isolated in dedicated function
  console.log("Processing user...");
  await fetch('/api/users', { method: 'POST', body: JSON.stringify(user) });
  localStorage.setItem('lastUser', user.id);
}

// Usage
const transformed = transformUser(user);  // Pure
await saveUser(user);  // Effectful
```

#### Rust:
```rust
// ❌ Bad - Mixed pure and impure
fn process_user(user: &User) -> String {
    println!("Processing user...");  // Side effect!
    // Imagine HTTP request here...
    user.name.to_uppercase()  // Pure logic mixed with effects
}

// ✅ Good - Separate
fn transform_user(user: &User) -> String {
    user.name.to_uppercase()  // Pure!
}

async fn save_user(user: &User) -> Result<(), String> {
    println!("Processing user...");  // Effects in dedicated function
    // HTTP request here...
    Ok(())
}

// Usage
let transformed = transform_user(&user);  // Pure
save_user(&user).await?;  // Effectful
```

---

## 📋 Checklist for Every Function

Before committing, ensure:

- [ ] Function is pure (no side effects)
- [ ] No mutations (all data immutable)
- [ ] Explicit error handling (Result/Option)
- [ ] No null/undefined (use Option)
- [ ] No classes (use functions + data)
- [ ] No loops (use map/filter/reduce/iterators)
- [ ] Clear types (no `any` in TS, no `dyn` in Rust unless necessary)
- [ ] Single responsibility
- [ ] Composable with other functions
- [ ] Testable in isolation

---

## 🧪 Testing Pure Functions

Pure functions are easy to test:

```typescript
// TypeScript
describe('increment', () => {
  it('should add 1 to a number', () => {
    expect(increment(5)).toBe(6);
    expect(increment(5)).toBe(6);  // Same input = same output!
  });
});
```

```rust
// Rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_increment() {
        assert_eq!(increment(5), 6);
        assert_eq!(increment(5), 6);  // Same input = same output!
    }
}
```

---

## 🎓 Resources

- **TypeScript:** [fp-ts](https://gcanti.github.io/fp-ts/)
- **Rust:** [Functional Programming in Rust](https://www.fpcomplete.com/rust/)
- **General:** [Mostly Adequate Guide to FP](https://mostly-adequate.gitbook.io/mostly-adequate-guide/)

---

## ✅ This Repository

Every file in this codebase follows these principles:

- ✅ `sanctuary-app/src/` - Pure functional React components
- ✅ `sanctuary-bridge/src/` - Functional TypeScript
- ✅ `sanctuary-app/src-tauri/src/` - Functional Rust

**No exceptions. No compromises.**

🚀 **Write code that is predictable, testable, and maintainable!**
