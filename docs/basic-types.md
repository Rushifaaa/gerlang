# Basic Types #

\[[Top: Contents](./index.md)\]  
[← Previous: The Basics](./the-basics.md) | [Next: Fields →](./fields.md)

## Primitive Types ##

**Gerlang** provides basic primitive types that are found in almost every other
 programming language.

|             Name             |           Description           | C Equivalent |  Size  | Default Value |
| :--------------------------- | :------------------------------ | :----------- | :----- | :-----------: |
| `Nichts`                     | nothing                         | `void`       | N/A    |   `Nichts`    |
| `Boolesch`                   | boolean                         | `bool`       | 8 bit  |   `Falsch`    |
| `Byte`                       | unsigned integer                | `uint8_t`    | 8 bit  |     `0b`      |
| `Kurze` `Ganzzahl`           | signed integer                  | `int16_t`    | 16 bit |     `0k`      |
| `Ganzzahl`                   | signed integer                  | `int32_t`    | 32 bit |     `0g`      |
| `Lange` `Ganzzahl`           | signed integer                  | `int64_t`    | 64 bit |     `0l`      |
| `Kurze` `Nummer`             | floating pointer decimal number | `float`      | 32 bit |    `0.0k`     |
| `Lange` `Nummer` or `Nummer` | floating pointer decimal number | `double`     | 64 bit |     `0.0`     |
| `Zeichen`                    | single character                | `uint32_t`   | 32 bit |    `'\0'`     |

### `Nichts` ###

`Nichts` is **Gerlang**s nothing, or _"void"_, type. It is like **Kotlin**s
 `Unit` type, as it is both a type and a value.

### `Boolesch` ###

The `Boolesch` type is a boolean value that can only have two values: `Wahr` and
 `Falsch`.

### Integers ###

`Byte`, `Kurze` `Ganzzahl`, `Ganzzahl` and `Lange` `Ganzzahl` are all integers.  
Digits in integer literals can have underscores to help with readability.  
By default, all integer literals use the decimal (denary) numeral system,
 certain prefixes can change it to either the binary, octal or hexadecimal
 numeral system.

|  Numeral System  | Prefix |
| :--------------- | :----: |
| Binary           |  `0b`  |
| Octal            |  `0o`  |
| Decimal (Denary) |  `0d`  |
| Hexadecimal      |  `0x`  |

Integer literals can have certain suffixes to target a specific integer type.  
When no suffix is used, the `Ganzzahl` is used by default.

|        Type        |   Suffix   |
| :----------------- | :--------: |
| `Byte`             | `b` or `y` |
| `Kurze` `Ganzzahl` |    `k`     |
| `Ganzzahl`         |    `g`     |
| `Lange` `Ganzzahl` |    `l`     |

`Byte` has two suffixes since when using the hexadecimal system, the letter `B`
 is a digit, which is why `y` can be used as a suffix for `Byte` instead.

### Decimal Numbers ###

`Kurze` `Nummer` and `Lange` `Nummer` are both floating point decimal numbers.  
Decimal literals must have digits on both the left and right side of the decimal
 point.  
Just like integer literals, underscores can be used in between digits for
 readability.

Floating point literals do not support different numeral systems.

Decimal literals can have suffixes to target the two different types just like
 the integer types.  
`Lange` `Nummer` is the default type when no suffix is used.

|       Type       |      Suffix      |
| :--------------- | :--------------: |
| `Kurze` `Nummer` |   `k` or `kn`    |
| `Lange` `Nummer` | `l`, `n` or `ln` |

Integer literals can produce `Kurze` `Nummer` or `Lange` `Nummer` values when
 the following suffixes are used.

|       Type       |  Suffix   |
| :--------------- | :-------: |
| `Nummer`         |   `kn`    |
| `Lange` `Nummer` | `n`, `ln` |

### `Zeichen` ###

`Zeichen` is the character type.  
It uses UTF-32 encoding, making it completely **Unicode** supportive.  
A `Zeichen` literal is a single printable **ASCII** character (`0x20` - `0x7E`),
 excluding the apostrophe character (`'`) and the backslash character (`\`),
 between two apostrophe characters (one on each side).

```gerlang
'a'
```

The following escape sequences can be used in `Zeichen` literals to also save
 characters that are not allowed in literals.

|          Escape Sequence          |          Description           |     Character      |
| :-------------------------------- | :----------------------------: | :----------------: |
| `\a`                              |           ASCII bell           |       `0x07`       |
| `\b`                              |        ASCII backspace         |       `0x08`       |
| `\t`                              |      ASCII horizontal tab      |       `0x09`       |
| `\n`                              |        ASCII line feed         |       `0x0A`       |
| `\v`                              |       ASCII vertical tab       |       `0x0B`       |
| `\f`                              |        ASCII form feed         |       `0x0C`       |
| `\r`                              |     ASCII carriage return      |       `0x0D`       |
| `\c`                              |          ASCII cancel          |       `0x18`       |
| `\e`                              |          ASCII escape          |       `0x1B`       |
| `\"`                              |       ASCII double quote       |       `0x22`       |
| `\'`                              |       ASCII single quote       |       `0x27`       |
| `\\`                              |        ASCII backslash         |       `0x5C`       |
| `\`_`o`_, `\`_`oo`_ or `\`_`ooo`_ |   Unicode character **OOO**    |   `0o`**`OOO`**    |
| `\x`_`xx`_                        |    Unicode character **XX**    |    `0x`**`XX`**    |
| `\u`_`xxxx`_                      |   Unicode character **XXXX**   |   `0x`**`XXXX`**   |
| `\U`_`xxxxxxxx`_                  | Unicode character **XXXXXXXX** | `0x`**`XXXXXXXX`** |

In this table, ***`o`*** characters are placeholder for octal digits and ***`x`***
 characters are placeholder for hexadecimal digits.

## Arrays ##

Arrays are sequences of multiple items that are of the same type.  
New items can not be added to existing arrays, nor can existing items be removed
 from an array.

### Variable-Size Arrays ###

Variable-size arrays can have any number of items.  
Array types are denoted by wrapping a type inside a pair of square brackets.

```gerlang
[Ganzzahl]
```

This works recursively with other array types as well. This way,
 multi-dimensional arrays are denoted.

```gerlang
[[Ganzzahl]]
[[[Ganzzahl]]]
```

Arrays are created by following an array type with curly braces.  
The items of the array are written inside the braces, separated by commas.

```gerlang
[Ganzzahl] {0, 1, 2}
```

The type before the curly braces may be omitted when the array type can be
 inferred.

```gerlang
Var X: [Ganzzahl];
X = {0, 1, 2};
```

Variable-size arrays may be concatenated using the `+` operator.  
This operation creates an entirely new array instance that leaves the two
 operand arrays unchanged.

<!--
	define `<<` and `>>` operators for arrays?
-->

### Fixed-Size Arrays ###

Fixed-size arrays can only have a specific amount of items.  
This amount must be constant and must be known before runtime.

Denoting such an array is done by following the type inside the square brackets
 with an asterisk and an integer.  
Alternatively, the type and the integer may swap places.

```gerlang
[Ganzzahl * 5]
[5 * Ganzzahl]
```

Creating instances of fixed-size arrays is done similar to how variable-size
 arrays are created.  
Writing more items in the curly braces than the fixed amount is set to is not
 permitted.  
If less are given, the rest are initialized to the types default value.  
If a type doesn't have a default value, it is an error.

```gerlang
[Ganzzahl * 3] {0, 1, 2}
[Ganzzahl * 5] {0, 1} // omitted items will be set to their default value (in this case 0)
```

The size of the array can also be inferred from by replacing the integer with a
 question mark.

```gerlang
[Ganzzahl * ?] {0, 1, 2, 3} // this value is of type `[Ganzzahl * 4]`
```

Only fixed-size array types are assignable to variable-size arrays, it doesn't
 work the other way around.

Concatenating fixed-size arrays with a variable-size array will always result in
 a variable-size array.  
When two fixed-size arrays are concatenated, it produces a fixed-size array with
 the size of both arrays added, i.e.: concatenating two fixed-size arrays, one
 with a size of 5, the other with a size of 3, will result in a fixed-size array
 with a size of 8.

## Tuples ##

Tuples are like fixed-size arrays that carry different types of items instead of
 items that are all of the same type.  
Tuple types are denoted by wrapping a list of types, separated by commas, inside
 parenthesis.

```gerlang
(Byte, Ganzzahl, Zeichen, Nummer)
```

Tuples are created by writing values inside parenthesis.

```gerlang
(64, 'a') // value is of tuple type `(Ganzzahl, Zeichen)`
```

When assigning a tuple, items may not be omitted.

```gerlang
Var X: (Ganzzahl, Zeichen);
X = (64, 'a'); // ok
X = (32); // error
```

Tuple types can also be inferred.

```gerlang
Var X = (64, 'a');
```

Tuple and array types are not compatible and tuples are only compatible when
 all of they're individual types are compatible with each other.

Tuples can be concatenated with each other with the `+` operator, producing a
 new tuple type with all types of each tuples.  
Concatenating two tuples, one of type `(Byte, Ganzzahl)` and of type
 `(Zeichen, Nummer)`, will result in a tuple of type
 `(Byte, Ganzzahl, Zeichen, Nummer)`.

<!--
	Built-in Map type maybe in later versions?

	[key_type: value_type]
-->

<!--
	Array and Tuple spreading?
	...[0, 1, 2]
	...(0, 1, 2)
-->

## Anonymous Functions ##

_TODO_
