<br>

<p align="center">
  <img src=".github/assets/logo-round.svg" style="width:125px;" />
</p>

<h1 align="center">Sleightful</h1>

<p align="center">
  <br />
  <a href="https://github.com/sleightful/sleightful/actions/workflows/test.yml"><img alt="Status" src="https://github.com/sleightful/sleightful/actions/workflows/test.yml/badge.svg"></a>
  <span>&nbsp;</span>
  <a href="https://github.com/sleightful/sleightful/releases"><img alt="version" src="https://img.shields.io/github/v/release/sleightful/sleightful?include_prereleases&label=version&logo=github&logoColor=white"></a>
  <br />
  <br />
  <pre><div align="center">npm i -D sleightful</div></pre>
</p>


<div align="center">
  <br />
  A solution to develop server-driven, client-rendered applications.
  <br />
  Sleightful is an <a href="https://inertiajs.com">Inertia.js</a> fork which sole purpose is to try to push the developer experience to the maximum.
  <br />
  <b>Use at your own risk</b>.
  <br />
  <br />
  <br />
</div>

<br>

#   Features

It's basically [Inertia.js](https://inertiajs.com), but:

- it's specifically tailored for Vite, Vue 3 and Laravel
- it's written with TypeScript, so it's fully typed
- it has a slightly different API, the core concepts stay the same
- it's distributed with a [Vite](https://vitejs.dev) plugin


&nbsp;


# Installation

## On a fresh Laravel project

A preset is provided for an easy installation. You will need to have Node v16+ installed on your machine to use it.

```sh
npx @preset/cli apply sleightful/laravel
```

## On an existing project

First, install the adapters:

```sh
pnpm i sleightful
composer require sleightful/laravel
```

If using Vite, use the plugin to register `vite-plugin-laravel`, `unplugin-vue-define-options` and the layout plugin:

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import sleightful from 'sleightful/vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [
    sleightful({ /* options */ }),
    vue(),
  ]
})
```

&nbsp;

# Documentation

> TODO

&nbsp;

# Q&A

**What's the goal of this project?**
> Sleightful aims to provide the best possible developer experience when using Laravel, Vue and Vite. It is supposed to stay minimalist, but without trading off the DX.
<br/>

**When should I use Sleightful instead of Inertia?**
> If you're living on the edge and looking for a solution that tries to get rid of most of the paper cuts you'd otherwise encounter. If you're building something serious, keep using Inertia: for now, it's more stable.

&nbsp;

**Why fork Inertia instead of contributing?**
> The maintainers of Inertia are currently busy with other projects or burnt-out, and have a specific philosophy for the project that does not necessarily match mine. This is totally fine, but I want to push.

&nbsp;

**Can I use Sleightful with other frameworks than Laravel or Vue?**
> The core of Sleightful is completely framework-agnostic, just like Inertia's. But there is no plan for an official adapter other than Laravel and Vue. So you can, but you will have to build your own adapters (which should not be that hard).


<p align="center">
  <br />
  <br />
  ·
  <br />
  <br />
  <sub>Built with ❤︎ by <a href="https://github.com/enzoinnocenzi">Enzo Innocenzi</a>. <br/> Original credits go to <a href="https://reinink.ca">Jonathan Reinink</a>, the core team and the contributors.</sub>
</p>
