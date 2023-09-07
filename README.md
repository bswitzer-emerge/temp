# Currents Marketplace

## Online Store Theme
The repository is the source code for the customizations to drive Current's Marketplace theme. It drives the brand and customizations for the online battery marketplace.

## Workflow
In order to have coordinated changes, when edits are made to the theme from inside Shopify's UI, a git commit is created. Therefore it is essential that when working locally, in order to reduce conflicts, it is required to update the project from the remote repo very frequently.

## Local Theme Development

#### 1. Clone the git repo
```
$ https://github.com/EmergeInteractive/currents-marketplace-mvp
$ cd currents-marketplace-mvp
```

#### 2. Install the Shopify CLI
Install the Shopify CLI using [Homebrew](https://brew.sh/). If you are on a different platform, you can [install the CLI](https://shopify.dev/docs/themes/tools/cli/install) via different means. Verify that it has installed correctly by printing out the version.
```
$ brew tap shopify/shopify
$ brew install shopify-cli
$ shopify version
```

If you need to, you can update to the latest CLI by running
```
brew upgrade shopify
```

#### 3. Compile and watch CSS
All the css in project is written in `scss` and needs to be compiled. We are using a gulp task to compile the `scss` into `css` and watch for changes. Note that you can skip this step if you are not making stylesheet changes. From the root of the project: 
```
$ cd _gulp
$ npm install
$ npm run gulp:watch
```

#### 4. Run the theme locally
Note that you will need access and a login to Shopify Partners for Emerge in order to be able to successfully log in. From the root of the directory:
```
$ shopify theme dev --store=currents-marketplace-dev
```

When the theme is running, you will see a printout with the local URL to preview your theme, something in the neighborhood of http://127.0.0.1:9292/.

### Using the CLI
You can get details on the use of the CLI [here in the Shopify docs](https://shopify.dev/docs/themes/tools/cli/commands), or by running `shopify help` at the command line. Some of the more useful/common commands are:

`shopify theme check` - will validate changes against the recommended practice

---
## Engineering Notes and Workarounds

### Theme code in JSON vs Liquid
Shopify uses a template engine called liquid, these are in the sections (Which are components that can be used in the WYSIWYG) and snippets ( bits of code that can be included in sections). "Templates" are can be liquid but should be JSON as it allows the WYSIWYG GUI create dynamic pages, that reference instances of sections.

### Collections Page
The collections page has been heavily customized and is the majority of the development.  See `secions/main-collection-product-grid.liquid` and `snippets/card-product-list.liquid`.

#### Product filtering

The currents marketplace template uses a fairly customized implimentation for the collections page, using trickery to create faux filters so users can use ranges to sort items. By default, Shopify prints out filters as checkboxes and there's no way to manipulate them.  This lead to a problem for custom metadata like the State Of Health (SOH) printing every value as an individual checkbox. Since batteries can have an SOH of 0-100%, a user could easily nearly 100 checkboxes to filter (depending on inventory/stock).

The solution was to hide the SOH check boxes and present the user with an alternative UI with range filters. This means having javascript logic to handle the changes, by using JS to literally find and check all the check boxes that match a range and click them.

The next layer of complexity is that Shopify is making various AJAX calls, thus breaking the attached events to the form, thus after a change has been made to the filtering, scripts must be reimplimented.

The final issue is if a user reloads a page or shared a page with the URL paramaters for a collections page, the appropriate filters may not appear as checked, thus the URL must be parsed and the update the UI to present an accurate representation of the SOH filters.

See: state-of-health-checkbox.js

#### Group add to cart

Another "creative" solution was handling the rest of being to add multiple items to the cart from the collections page. Shopify does not have this functionality thus javascript was used again to simulate a behavior.  Users can add multiple items by checking boxes next to the products and clicking add to cart. Javascript finds the checked boxes, and then clicks the add to cart for that item. Due the limiations, it has to wait via a time out to add to cart.

Due to the same issues of AJAX destroying the dom, the scripts must be reattached after a mutation to the DOM.

See: group-add-to-cart.js

#### Add to cart needs to reflect inventory

All products are uniques, thus when the add to cart needs to default to out of stock after a single mouse click. The issue is inventory checks are only perform when the item is added to cart, so if there's one item in stock, it will allow the user to add to cart but not update   Javascript listens for an add to cart click and sets the inventory to out of stock.

Due to the same issues of AJAX destroying the dom, the scripts must be reattached after a mutation to the DOM.

See: add-to-cart-sanity-check.js

### The spaghetti strategy for JS and CSS

Since any editable area generates its own ID from Liquid, many of the templates use inline CSS and JS. We have continued this rather than trying to encapsulate all into the master CSS/JS.


## Weirdness of Shopify 

Shopify when wired to github will create it's own commits when manipulating the theme via the UI. 

By default when you login if the store is password protected, you'll need to pull the password for the front end from admin login on the shopify hosted site

Dev site example:

PW: yeceit
https://currents-marketplace-dev.myshopify.com/admin/online_store/preferences?tutorial=unlock


## JSON vs Liquid

> JSON templates provide more flexibility for merchants to add, remove, and reorder sections, including app sections. Additionally, they minimize the amount of data in settings_data.json. Instead, data is stored directly in the template, which improves the performance of the theme editor.


https://shopify.dev/docs/themes/architecture/templates

Ideally, when creating templates, they will be JSON that links to template files with editable areas.


## Compiling SCSS

In the `/_gulp` dir, you'll need to install the node dependencies.

Run `npm install` and then run `gulp watch`. 




### Helpful Links

List of the liquid filters
https://shopify.dev/docs/api/liquid/filters

GitHub
https://github.com/EmergeInteractive/currents-marketplace-mvp

# Git Strategy

## Git Branches

The branching strategy for Currents is straight forward: The live site is on master, and development is on development (or potentially another code branch). Due to the content nature where editing the theme will cause Git changes (to JSON files) there may be merge conflicts that need to be manually handled. 

## Controlling code branches

Code branches can be switched on Shopify. This is done by going to Add Theme -> Connect theme, use the account Emerge and then find the Currents repo. This will add the branch. To swap themes, click publish and from the themes.
https://currents-marketplace-dev.myshopify.com/admin/themes?appLoadId=5c7993f0-d020-4495-8769-7f5661f25e28




# Generic Readme info

## Dawn

[![Build status](https://github.com/shopify/dawn/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/Shopify/dawn/actions/workflows/ci.yml?query=branch%3Amain)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?color=informational)](/.github/CONTRIBUTING.md)

[Getting started](#getting-started) |
[Staying up to date with Dawn changes](#staying-up-to-date-with-dawn-changes) |
[Developer tools](#developer-tools) |
[Contributing](#contributing) |
[Code of conduct](#code-of-conduct) |
[Theme Store submission](#theme-store-submission) |
[License](#license)

Dawn represents a HTML-first, JavaScript-only-as-needed approach to theme development. It's Shopify's first source available theme with performance, flexibility, and [Online Store 2.0 features](https://www.shopify.com/partners/blog/shopify-online-store) built-in and acts as a reference for building Shopify themes.

* **Web-native in its purest form:** Themes run on the [evergreen web](https://www.w3.org/2001/tag/doc/evergreen-web/). We leverage the latest web browsers to their fullest, while maintaining support for the older ones through progressive enhancement—not polyfills.
* **Lean, fast, and reliable:** Functionality and design defaults to “no” until it meets this requirement. Code ships on quality. Themes must be built with purpose. They shouldn’t support each and every feature in Shopify.
* **JavaScript not required, fails gracefully:** We extract every bit of speed and functionality out of HTTP, semantic HTML, and CSS before writing our first line of JavaScript. JavaScript can only be used to progressively enhance features.
* **Server-rendered:** HTML must be rendered by Shopify servers using Liquid. Business logic and platform primitives such as translations and money formatting don’t belong on the client. Async and on-demand rendering of parts of the page is OK, but we do it sparingly as a progressive enhancement.
* **Functional, not pixel-perfect:** The Web doesn’t require each page to be rendered pixel-perfect by each browser engine. Using semantic markup, progressive enhancement, and clever design, we ensure that themes remain functional regardless of the browser.

You can find a more detailed version of our theme code principles in the [contribution guide](https://github.com/Shopify/dawn/blob/main/.github/CONTRIBUTING.md#theme-code-principles).

## Getting started

We recommend using Dawn as a starting point for theme development. [Learn more on Shopify.dev](https://shopify.dev/themes/getting-started/create). 

> If you're building a theme for the Shopify Theme Store, then you can use Dawn as a starting point. However, the theme that you submit needs to be [substantively different from Dawn](https://shopify.dev/themes/store/requirements#uniqueness) so that it provides added value for merchants. Learn about the [ways that you can use Dawn](https://shopify.dev/themes/tools/dawn#ways-to-use-dawn).

## Staying up to date with Dawn changes

Say you're building a new theme off Dawn but you still want to be able to pull in the latest changes, you can add a remote `upstream` pointing to this Dawn repository.

1. Navigate to your local theme folder.
2. Verify the list of remotes and validate that you have both an `origin` and `upstream`:
```sh
git remote -v
```
3. If you don't see an `upstream`, you can add one that points to Shopify's Dawn repository:
```sh
git remote add upstream https://github.com/Shopify/dawn.git
```
4. Pull in the latest Dawn changes into your repository:
```sh
git fetch upstream
git pull upstream main
```

## Developer tools

There are a number of really useful tools that the Shopify Themes team uses during development. Dawn is already set up to work with these tools.

### Shopify CLI

[Shopify CLI](https://github.com/Shopify/shopify-cli) helps you build Shopify themes faster and is used to automate and enhance your local development workflow. It comes bundled with a suite of commands for developing Shopify themes—everything from working with themes on a Shopify store (e.g. creating, publishing, deleting themes) or launching a development server for local theme development.

You can follow this [quick start guide for theme developers](https://github.com/Shopify/shopify-cli#quick-start-guide-for-theme-developers) to get started.

### Theme Check

We recommend using [Theme Check](https://github.com/shopify/theme-check) as a way to validate and lint your Shopify themes.

We've added Theme Check to Dawn's [list of VS Code extensions](/.vscode/extensions.json) so if you're using Visual Studio Code as your code editor of choice, you'll be prompted to install the [Theme Check VS Code](https://marketplace.visualstudio.com/items?itemName=Shopify.theme-check-vscode) extension upon opening VS Code after you've forked and cloned Dawn.

You can also run it from a terminal with the following Shopify CLI command:

```bash
shopify theme check
```

### Continuous Integration

Dawn uses [GitHub Actions](https://github.com/features/actions) to maintain the quality of the theme. [This is a starting point](https://github.com/Shopify/dawn/blob/main/.github/workflows/ci.yml) and what we suggest to use in order to ensure you're building better themes. Feel free to build off of it!

#### Shopify/lighthouse-ci-action

We love fast websites! Which is why we created [Shopify/lighthouse-ci-action](https://github.com/Shopify/lighthouse-ci-action). This runs a series of [Google Lighthouse](https://developers.google.com/web/tools/lighthouse) audits for the home, product and collections pages on a store to ensure code that gets added doesn't degrade storefront performance over time.

#### Shopify/theme-check-action

Dawn runs [Theme Check](#Theme-Check) on every commit via [Shopify/theme-check-action](https://github.com/Shopify/theme-check-action).

