# New Dependencies Advisor

GitHub Action adding comments to pull requests with package health information about newly added npm dependencies

See it in action 👇

![Add a comment in a Pull Request informing of newly added dependencies](https://raw.githubusercontent.com/lirantal/github-action-new-dependencies-advisor/main/.github/new-dependencies-alerts-screenshot.png)

## Why?

Adding new dependencies in a project should never be a small change, and often
it should trigger discussions between maintainers. This action can help you
making sure that you are not missing the addition of new package in your npm project's
`dependencies` and `devDependencies`.

## How does it work?

To highlight new packages, this action compares the list of dependencies 
present in the current pull request branch with the ones present in the base branch.

This check only occurs for each `package.json` file added or updated with the
current pull request. This action is not only looking at the root-level `package.json` but potentially
any existing `package.json` in the project to be compatible with monorepo  projects.

## Inputs

### `token`

Specify the built-in secrets available to Actions via the `token` input. Here's an example for a step in the job:

```yml
      - name: "Deps: show dependencies metadata"
        uses: lirantal/github-action-new-dependencies-advisor@v1.1.1
        with:
          token: ${{ secrets.GITHUB_TOKEN }}

```

Not required.

## Usage

This _GitHub Action_ should run every time a commit is pushed to the pull request
to check any potential addition or change in one of your `package.json`.

```yml
name: "Deps: show new dependencies metadata"
on:
  - pull_request

jobs:
  deps_new_dependencies_advisor:
    runs-on: ubuntu-latest
    steps:
      - name: "Checkout repo for a local instance"
        uses: actions/checkout@v2
        
      - name: "Deps: show new dependencies metadata"
        uses: lirantal/github-action-new-dependencies-advisor@v1.1.1
        with:
          token: ${{ secrets.GITHUB_TOKEN }}

```

## License

This project is released under the MIT License.

## Author

Damien Senger <hello@raccoon.studio>

Liran Tal <liran.tal@gmail.com>

## Documentation

- [Project documentation](./docs/README.md) - development, testing, architecture, and conventions.
