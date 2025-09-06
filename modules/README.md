# LumenOne Modules

Welcome to the **LumenOne** module system!  
This guide explains how to create and integrate your own modules into LumenOne.

---

## Module Structure

Each module should have the following structure:

```

modules/
└── myModule/
├── index.js
├── config.json
└── icon.png   (optional)

```

- **index.js**: The main file of the module. It runs when the application starts.
- **config.json**: Contains module information.
- **icon.png**: Module icon (optional). If missing, a default SVG will be used.

---

## Example `config.json`

```json
{
  "name": "My Awesome Module",
  "version": "1.0.0",
  "description": "An example module for LumenOne.",
  "author": "LumenLabs"
}
```

- `name`: The name displayed in the interface.
- `version`: Module version.
- `description`: A short description of the module.
- `author`: : The username, name, or other identifier of the person who created the module

---

## Example `index.js`

```js
console.log("My Awesome Module has been loaded!");
```

> Any code in `index.js` will execute **when LumenOne starts**.

---

## Module Icon

- Place an `icon.png` file inside the module folder.
- If no icon is provided, the interface will automatically display a default SVG.

---

## Adding Your Module to LumenOne

1. Create a new folder in `modules/` for your module.
2. Add `index.js` and `config.json`.
3. Add `icon.png` if you want a custom icon.
4. Restart LumenOne to automatically load your module.

---

## Best Practices

- Test your module locally before publishing.
- Avoid blocking LumenOne startup: use `try/catch` for errors in `index.js`.
- Use unique names to prevent conflicts with other modules.

---

## Minimal Example Module

```
modules/
└── exampleModule/
    ├── index.js      # console.log("Example Module loaded!");
    ├── config.json   # {"name":"Example Module","version":"1.0.0"}
    └── icon.png      # optional
```

Your module will appear in the **Modules** interface of LumenOne.

---

## Support

For questions or issues, join our Discord.
