# The Basics #

\[[Top: Contents](./index.md)\]  
[← Previous: About](./about.md) | [Next: Basic Types →](./basic-types.md)

## Statements ##

Like most modern languages, statements in **Gerlang** are terminated implicitly
 after a line break when a statement seems to end.  
However, it is best practice to terminate every statement explicitly. This is
 done by writing a semicolon (`;`) at the end of the statement.

## Symbols ##

Symbols in **Gerlang** consist of one or more words that are separated by spaces.  
The following are the only characters that are allowed in words:

* **ASCII** letters (`A` - `Z` & `a` - `z`)
* **ASCII** digits (`0` - `9`)
* **Unicode** German umlaut letters (`Ä`, `ä`, `ö`, `Ö`, `ü` & `Ü`)
* **Unicode** German eszett (sharp s) letter (`ẞ` & `ß`)

In additional to only containing these characters, words are not allowed to
 start with **ASCII** digits.

The amount of spaces between words does not make a difference, three spaces has
 the same effect as just one.

Using case systems for words like snake case (`foo_bar`), pascal case (`FooBar`)
 or camel case (`fooBar`) is discouraged.
