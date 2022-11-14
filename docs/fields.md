# Fields — Variables & Constants #

\[[Top: Contents](index.md)\]  
[← Previous: Basic Types](basic-types.md) | [Next: Functions →](functions.md)

Field declarations consist of the keyword `Var` or `Konst`, the name of the field and a type specifier.  
The name must be a valid symbol and between the name and the type specified must be a colon character (`:`).

```gerlang
Var X: Ganzzahl;
```

A field is initialized with a value using the assignment operator (`=`).

```gerlang
Var X: Ganzzahl; // declaration
X = 64; // initialization
```

Fields can only be used after they have been initialized.

```gerlang
Var X: Ganzzahl;
X; // error
X = 64;
X; // ok
```

Declaration and initialization can also be combined.

```gerlang
Var X: Ganzzahl = 64;
```

Thanks to type inference, the type specifier may be omitted when declaration and initialization are combined.

```gerlang
Var X = 64; // type is inferred, `X` is of type `Ganzzahl`
```

The only difference between variables and constants are that, after initialization, constants can not be re-assigned.  
Constants are declared using the `Konst` keyword instead of the `Var` keyword.

```gerlang
Var X: Ganzzahl;
X = 64;
X = 128; // ok

Konst Y: Ganzzahl;
Y = 64;
Y = 128; // error
```
