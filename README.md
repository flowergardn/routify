# Routify

Generate processable JSON data for routes.

## Installation

```bash
npm install -g https://github.com/astridlol/routify
```

## Usage

In order to use Routify, you need to add some comments to your routes. Here's an example:

```js
/** Allows a user to create an account
 * @route: /accounts/
 * @method: POST
 * @returns: { success: true, ...accountData }
 */
```

After that, you can use Routify to generate a JSON file of your routes.

```bash
routify --file [file with routes]
```

By default, the file will be stored in the current directory, and will be named as so: `API-[current-date]`.<br>
In order to change the name of the file, you can use the `--api` flag.
```bash
routify --file [file with routes] --api [what the routes do]
```

## Example

```bash
routify --file routes.js
```

(I could have probably made this in a better way (using go), but I was too lazy to do it & wanted to make it work quickly)
