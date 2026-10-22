import GitHubClient from '../../services/github-sdk'
import getLocalPackageInfo from './getLocalPackageInfo'
import resolvePackageName from './resolvePackageName'
import {DependenciesList, Dependency} from '../../types/package'

// keeps the version, which holds the real package name of an npm alias
const listDependencies = (dependencies: Record<string, string>): Dependency[] =>
  Object.keys(dependencies).map(name => ({name, version: dependencies[name]}))

async function analysePackage(file: string): Promise<DependenciesList> {
  const ghClient = GitHubClient.getClient()

  // fetches information about the package in the base branch
  const baseBranch = await ghClient.getBaseBranch()
  const basePackage = await ghClient.getPackage(file, baseBranch)
  const baseDeps = basePackage
    ? listDependencies(basePackage.dependencies).map(resolvePackageName)
    : []
  const baseDevDeps = basePackage
    ? listDependencies(basePackage.devDependencies).map(resolvePackageName)
    : []

  // fetches information about the updated package file
  const updatedPackage = await getLocalPackageInfo(file)
  const updatedDeps = listDependencies(updatedPackage.dependencies)
  const updatedDevDeps = listDependencies(updatedPackage.devDependencies)

  // filters new packages not existing in the base branch, whatever the name
  // of the dependency installing them
  const newDeps = updatedDeps.filter(
    dep => !baseDeps.includes(resolvePackageName(dep))
  )
  const newDevDeps = updatedDevDeps.filter(
    dep => !baseDevDeps.includes(resolvePackageName(dep))
  )

  return {
    dependencies: newDeps,
    devDependencies: newDevDeps
  }
}

export default analysePackage
