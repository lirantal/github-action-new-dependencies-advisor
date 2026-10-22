import {Dependency} from '../../types/package'

/**
 * Returns the name of the package installed for a dependency, which differs
 * from the dependency name for an npm alias (`npm:<package>@<range>`)
 *
 * @param dependency Dependency declared in a `package.json` file
 */
function resolvePackageName({name, version}: Dependency): string {
  if (!version.startsWith('npm:')) return name

  // starts the search after the first character, the `@` of a scoped package
  const spec = version.slice('npm:'.length)
  const rangeIndex = spec.indexOf('@', 1)

  return rangeIndex === -1 ? spec : spec.slice(0, rangeIndex)
}

export default resolvePackageName
