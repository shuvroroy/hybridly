# Upgrade guide

This guide describes how to upgrade from `v0.0.1-alpha` to `v0.1.0`.

## Moving pages and layouts

- **Likelihood of impact**: <span class="text-red-700 dark:text-red-300">high</span>

Previously, the expected emplacement for both page components and layouts was in `resources/views`. This has now moved to `resources`, so you should move them here.

```diff
  resources/
- ├── views/
- │   ├── layouts/
- │   │   └── default.vue
- │   └── pages/
- │       ├── index.vue
- │       └── security/
- │           └── login.vue
+ ├── layouts/
+ │   └── default.vue
+ └── pages/
+     ├── index.vue
+     └── security/
+         └── login.vue
```

## Updating `initializeHybridly`

- **Likelihood of impact**: <span class="text-red-700 dark:text-red-300">high</span>

The function that initializes Hybridly was previously exported by `hybridly/vue`. To simplify the setup, it is now exported by a virtual import, so the `pages` options is no longer needed.

```ts
import { initializeHybridly } from 'virtual:hybridly/config' // [!code ++]
import { initializeHybridly } from 'hybridly/vue' // [!code --]
import 'virtual:hybridly/router' // [!code --]

initializeHybridly({
	pages: import.meta.glob('@/domains/**/pages/**/*.vue', { eager: true }), // [!code --]
})
```

The `pages` option is automatically setup according to the optional [`hybridly.config.ts`](../configuration/architecture.md) configuration file. To enable or disable eager-loading of page components, you may use the [`eager`](../configuration/architecture.md#eager) option in that file.

## Updating `vite.config.ts`

- **Likelihood of impact**: <span class="text-red-700 dark:text-red-300">high</span>

The Vite plugin now registers `laravel-vite-plugin`, `@vitejs/plugin-vue`, `vite-plugin-run`, `unplugin-auto-import`, `unplugin-vue-components` and `unplugin-icons` automatically.

You may remove all of them from `vite.config.ts` and configure them individually through the options of `hybridly`:

```ts
import path from 'node:path'
import hybridly from 'hybridly/vite'
import { defineConfig } from 'vite'
import { HeadlessUiResolver } from 'unplugin-vue-components/resolvers'

export default defineConfig({
	plugins: [
		hybridly({
			laravel: {
				valetTls: true,
			},
			customIcons: ['aircraft'], // registers icons in `resources/icons/aircraft`
		}),
	]
})
```

These plugins can also be removed from `package.json`. If you need to register resolvers from `unplugin-vue-components`, you still need to have it installed.

Additionally, it is no longer required to manually register the `@` alias.

You may read more about the configuration of all included plugins in the [configuration section](../configuration/vite.md).

## Updating `.gitignore`

- **Likelihood of impact**: medium

Hybridly now generates its types and some other files in a root-level `.hybridly` directory. This directory needs to be ignored from Git because the files in it changes often and are generated when the development server starts. 

```gitignore
/public/build
/node_modules
...
resources/types/*.d.ts // [!code --]
.hybridly // [!code ++]
```

If you were ignoring files in `resources/types`, you may also delete this directory and remove it from `.gitignore`.


## Updating `config/hybridly.php`

- **Likelihood of impact**: medium

If you published `config/hybridly.php`, `i18n.locales_path` and `i18n.lang_path` should be removed because they will interfere with their new default values. 

Additionally, since PHP cannot read `hybridly.config.ts`, `testing.page_paths` should be updated accordingly:

```php
  'testing' => [
      'page_paths' => [
          resource_path('views/pages'), // [!code --]
          resource_path('pages'), // [!code ++]
      ],
  ],
```

## Creating `hybridly.config.ts`

- **Likelihood of impact**: low

If you were using a domain-based architecture, you will now need to indicate that to Hybridly by creating `hybridly.config.ts` and setting `domains` to `true`:

```ts
import { defineConfig } from 'hybridly/config'

export default defineConfig({
	domains: true,
})
```

You may read more about the options available [configuration section](../configuration/architecture.md#options).

## Updating `tsconfig.json`

- **Likelihood of impact**: low

A pre-configured `tsconfig.json` file is generated when the development server starts. Instead of having your own, you may extend it:

```json
{
	"extends": "./.hybridly/tsconfig.json"
}
```

## Moving `root.blade.php`

- **Likelihood of impact**: low

Previously, the recommended emplacement for `root.blade.php` was in `resources/views`. This has now moved to `resources/application`, so you may move it or keep it where it was.

If you no longer have any file in `resources/views`, you may remove this path from `config/view.php` to avoid any issue while caching views during deployment.
