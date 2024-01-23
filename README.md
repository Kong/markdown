# Kong Markdown

> [!IMPORTANT]
> This repository and the `@kong/markdown` package are currently in development on the `main` branch. Breaking changes should be expected.

Kong's open-source markdown renderer and live editor.

- [TODO](#todo)
- [Usage](#usage)
  - [Installation](#installation)
  - [Notes](#notes)
  - [Props](#props)
  - [Slots](#slots)
  - [Events](#events)
- [Contributing \& Local Development](#contributing--local-development)
  - [Development Sandbox](#development-sandbox)
  - [Lint and fix](#lint-and-fix)
  - [Testing](#testing)
  - [Build for production](#build-for-production)
  - [Committing Changes](#committing-changes)
  - [Package Publishing](#package-publishing)

## TODO

- [ ] Optimize exports via separate bundles for syntax highlighting options

## Usage

### Installation

Install the `@kong/markdown` package in your host project.

```sh
pnpm add @kong/markdown

# OR

yarn add @kong/markdown
```

### Notes

By default, the editor does not handle the Tab key unless there is an active text selection within the `textarea`. This isn't an oversight —- it is an intentional decision to make the default configuration pass the ["no keyboard trap"](https://www.w3.org/TR/WCAG21/#no-keyboard-trap) criterion of the W3C Web Content Accessibility Guidelines.

Some users browse the web without access to a pointing device, and it is really unfriendly towards such users to have focusable inputs that they cannot escape from.

### Props

#### `v-model`

- type: `String`
- required: `false`
- default: `''`

A Vue `ref<string>` from the host app that is bound to the markdown content in the host application. The value will be updated as the user edits the document and emitted via the `update:modelValue` event.

Alternatively, if you do not need a two-way binding, you can pass in the markdown content via the `modelValue` prop.

#### `editable`

- type: `Boolean`
- default: `false`

Is the user allowed to edit the document. Defaults to `false`.

In order to utilize the `edit`, `split`, and `preview` modes, this `editable` prop **must** be set to `true`.

> [!NOTE]
> If the `editable` prop is set to `false`, it will override the `mode` and force into read-only mode.

#### `downloadable`

- type: `Boolean`
- default: `false`

Is the user allowed to download the document. Defaults to `false`.

#### `filename`

- type: `String`
- default: `'document'`

The markdown document filename used when downloaded.

#### `mode`

- type: `'read' | 'edit' | 'split' | 'preview'`
- required: `false`
- default: `'read'`

The initial mode of the markdown component.

Mode | Description
:--- | :---
`read` | Read-only mode. The editor is not visible. An "Edit" button is visible if the `editable` prop is `true`.
`edit` | Edit-only mode. The rendered markdown preview is not visible. Requires the `editable` prop to be set to `true`.
`split` | Split-view mode. The component is showing a side-by-side editor and markdown preview. Requires the `editable` prop to be set to `true`.
`preview` | Markdown preview mode. The component is showing a preview of the rendered markdown content. Requires the `editable` prop to be set to `true`.

#### `tabSize`

- type: `Number`
- required: `false`
- default: `2`

The number of spaces to insert when a user tabs within the textarea. Defaults to `2` with a maximum value of `6`.

#### `theme`

- type: `'light' | 'dark'`
- required: `false`
- default: `''`

The theme used when the component initializes, one of `'light'` or `'dark'`. Defaults to the user's browser's preferred color scheme (recommended).

To customize the colors for a specific theme, you may provide values for the underlying CSS custom properties, scoped to the container.

For example, if you want to change the rendered markdown document's background color:

```css
.theme-light .markdown-content {
  --kui-color-background: #eee;
}
.theme-dark .markdown-content {
  --kui-color-background-inverse: #292D3E;
}
```

#### `maxHeight`

- type: `Number`
- required: `false`
- default: `300`

The maximum height of the component when not being displayed fullscreen. Defaults to `300` with a minimum value of `100`.

#### `fullscreenOffsetTop`

- type: `Number`
- required: `false`
- default: `0`

When the editor is in fullscreen, the top offset, in pixels.

#### `fullscreenZIndex`

- type: `Number`
- required: `false`
- default: `1001`

The `z-index` of the component when in fullscreen. Defaults to `1001`.

### Slots

#### `editor-actions`

A slot for providing editor actions to the markdown component, shown at the far-right of the toolbar.

The default slot provides `Save` and `Cancel` buttons as well as two methods, `save` and `cancel`, to trigger the built-in actions from your own component. Here's an example:

```html
<MarkdownUi
  v-model="content"
  editable
  @save="saveChanges"
>
  <template #editor-actions="{ save }">
    <!-- Call the provided `save` method when custom button is clicked -->
    <button @click="save">Upload document</button>
  </template>
</MarkdownUi>

<script setup lang="ts">
// When the `@save` event is emitted, POST the markdown content to the API
const saveChanges = async (markdownContent: string): Promise<void> => {
  try {
    const response = await fetch('https://example.com/documents/', {
      method: 'POST',
      headers: { 'Content-Type': 'text/markdown' },
      body: markdownContent,
    })

    const result = await response.json()
    console.log('Success:', result)
  } catch (error) {
    console.error('Error(saveChanges):', error);
  }
}
</script>
```

#### `toolbar-right`

A slot for providing additional toolbar content to the markdown component, shown to the right of the editor shortcuts and to the left of the `editor-actions` slot (the Cancel and Save buttons).

#### `edit`

A slot for providing a custom element (i.e. `button`) that enables the `Edit` mode within the component. The slot exposes the `edit` method to trigger the built-in function.

When the `edit` button (native, or custom) is clicked, the component will automatically determine whether to enable `edit` or `split` mode based on the browser's viewport width. On larger screens, the editor will launch in `split` mode.

#### `download`

A slot for providing a custom element (i.e. `button`) that triggers the `Download` functionality within the component. The slot exposes the `download` method to trigger the built-in function.

When the `download` button (native, or custom) is clicked, the component will download the document to the user's computer.

> [!NOTE]
> The `downloadable` prop must be set to `true` to enable this slot.

```html
<MarkdownUi
  v-model="content"
  downloadable
>
  <template #download="{ download }">
    <!-- Call the provided `download` method when custom button is clicked -->
    <button @click="download">Download the doc</button>
  </template>
</MarkdownUi>
```

### Events

#### `update:modelValue`

Emitted when the user modifies the raw markdown content in the editor. The event contains a payload `string` of the raw markdown content.

> [!NOTE]
> The `update:modelValue` event is debounced as the user is typing.

#### `save`

Emitted whenever the user triggers the `save` toolbar action. The event contains a payload `string` of the raw markdown content.

#### `cancel`

Emitted whenever the user triggers the `cancel` toolbar action, which also changes the component `mode` to `read`.

#### `mode`

Emitted whenever the component mode is changed. The event contains a payload `string` of the active mode: `read | edit | split | preview`

#### `fullscreen`

Emitted whenever the component is toggled in/out of fullscreen. The event contains a payload `boolean` indicating if fullscreen is enabled.

## Contributing & Local Development

To get started, install the package dependencies

```sh
pnpm install
```

### Development Sandbox

This repository includes a Vue sandbox app (see the `/sandbox` directory) to allow you to experiment with icons.

#### Build and Preview the Development Sandbox

To build and run a local preview of the Sandbox:

```sh
pnpm run preview
```

### Lint and fix

Lint package files, and optionally auto-fix detected issues.

```sh
# Stylelint only
pnpm run stylelint

# Stylelint and fix
pnpm run stylelint:fix

# ESLint only
pnpm run lint

# ESLint and fix
pnpm run lint:fix
```

### Testing

Unit and component tests are run with [Vitest](https://vitest.dev/).

```sh
# Run tests
pnpm run test

# Run tests in the Vitest UI
pnpm run test:open
```

### Build for production

```sh
pnpm run build
```

### Committing Changes

[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

This repo uses [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/).

[Commitizen](https://github.com/commitizen/cz-cli) and [Commitlint](https://github.com/conventional-changelog/commitlint) are used to help build and enforce commit messages.

It is **highly recommended** to use the following command in order to create your commits:

```sh
pnpm run commit
```

This will trigger the Commitizen interactive prompt for building your commit message.

#### Enforcing Commit Format

[Lefthook](https://github.com/evilmartians/lefthook) is used to manage Git Hooks within the repo.

- A `commit-msg` hook is automatically setup that enforces commit message stands with `commitlint`, see [`lefthook.ymal`](./lefthook.yaml)
- A `pre-push` hook is used that runs `eslint` before allowing you to push your changes to the repository

Additionally, CI will use `commitlint` to validate the commits associated with a PR in the `Lint and Validate` job.

### Package Publishing

This repository utilizes [Semantic Release](https://github.com/semantic-release/semantic-release) for automated package publishing and version updates.
