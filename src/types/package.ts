export interface Package {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any

  dependencies: Record<string, string>
  devDependencies: Record<string, string>
}

export interface Dependency {
  /** Name of the dependency in the `package.json` file */
  name: string
  /** Version specifier, `npm:<package>@<range>` for an npm alias */
  version: string
}

export interface DependenciesList {
  dependencies: Dependency[]
  devDependencies: Dependency[]
}
