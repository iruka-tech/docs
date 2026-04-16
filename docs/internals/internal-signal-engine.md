# Internal Signal Engine

This document is internal.

It explains how megabat interprets public signal JSON, compiles it, stores it, binds it to providers, and evaluates it at runtime.

This is not the public API contract.
For the public contract, start with [PUBLIC_SIGNAL_MODEL.md](../product/public-signal-model.md) and [DSL.md](../product/dsl.md).

## Internal Terms

### Ref

A `ref` is an internal reference node to one data source leaf.

Examples:

- `StateRef`
- `EventRef`
- `RawEventRef`

Refs are the leaves of the internal expression tree.

### Binding

A binding is the protocol/runtime meaning of a semantic state reference.

Example:

- public meaning: `ERC4626.Position.shares`
- binding meaning: `erc4626:Position:shares`
- runtime execution: call `balanceOf(owner)` on `contractAddress`

### Plan

A plan is a generic execution intent created before provider-specific execution.

Example:

- generic state plan: `family=state`, `provider=rpc`, `chainId=1`, `protocol=erc4626`, `ref=...`, `timestamp=...`

### AST

The AST is the compiled internal expression tree used by the evaluator.

It contains:

- refs
- constants
- binary expressions
- final comparison conditions

## End-To-End Pipeline

### 1. Validate Public JSON

The API validates incoming requests with Zod.

Main file:

- [validators.ts](../src/api/validators.ts)

This step checks:

- shape
- enums
- exactly-one-of `metric` or `state_ref`
- numeric literal format

### 2. Apply Scope And Compile

The API compiles signal definitions at write time.

Main files:

- [compile-signal.ts](../src/engine/compile-signal.ts)
- [compiler.ts](../src/engine/compiler.ts)

This step:

- applies scope defaults
- normalizes state filters
- compiles `metric` sugar into the same internal shape as raw `state_ref`
- compiles conditions into AST nodes

### 3. Store Both Public And Internal Forms

Stored signal definitions have two layers:

```ts
{
  version: 1,
  dsl: SignalDefinition,
  ast: CompiledSignalDefinition
}
```

This is intentional:

- `dsl` preserves the public authoring shape
- `ast` preserves the internal execution shape

### 4. Normalize On Read

When signals are loaded back from storage, megabat normalizes the stored definition again.

Main file:

- [compile-signal.ts](../src/engine/compile-signal.ts)

This protects compatibility when old stored forms are read back.

### 5. Build Generic Source Plans

Main file:

- [source-plan.ts](../src/engine/source-plan.ts)

State reads first become generic plans, for example:

```ts
{
  family: "state",
  provider: "rpc",
  protocol: "erc4626",
  chainId: 1,
  ref: StateRef,
  timestamp?: number
}
```

This is still not protocol-executed.

### 6. Bind Generic State To Protocol Execution

Main files:

- [rpc-state-resolver.ts](../src/engine/rpc-state-resolver.ts)
- [state-definitions.ts](../src/engine/state-definitions.ts)
- `src/protocols/morpho`
- `src/protocols/erc4626`

This is where semantic state meanings become executable RPC calls.

Examples:

- Morpho market and position bindings
- ERC-4626 `Position.shares` binding to `balanceOf(owner)`

### 7. Execute Reads

Main files:

- [morpho-fetcher.ts](../src/engine/morpho-fetcher.ts)
- [rpc/index.ts](../src/rpc/index.ts)
- [indexing/client.ts](../src/indexing/client.ts)

Execution paths:

- state -> RPC
- indexed -> Envio-backed indexing boundary
- raw -> HyperSync-backed indexing boundary

### 8. Evaluate AST

Main files:

- [evaluator.ts](../src/engine/evaluator.ts)
- [condition.ts](../src/engine/condition.ts)

The evaluator:

- resolves snapshots
- fetches refs
- evaluates arithmetic
- compares left vs right
- combines results through `AND` / `OR`
- applies `group`
- applies `aggregate`

## Design Boundaries

### Public Contract

Owned by:

- [PUBLIC_SIGNAL_MODEL.md](../product/public-signal-model.md)
- [DSL.md](../product/dsl.md)
- [API.md](../reference/api.md)

This should answer:

- what users can express
- what users cannot express
- what string enums exist

### Internal Engine

Owned by:

- this document
- [ARCHITECTURE.md](architecture.md)
- [SOURCES.md](sources.md)

This should answer:

- how refs are compiled
- how bindings work
- how providers are chosen
- how evaluation works

## Current Internal Design Rules

- state binding metadata is single-sourced in [state-definitions.ts](../src/engine/state-definitions.ts)
- `metric` sugar must compile through the same binding registry as raw `state_ref`
- provider selection belongs in planning/binding layers, not in the public DSL
- public docs should not depend on internal terms like AST, planner, or binder to explain the API
