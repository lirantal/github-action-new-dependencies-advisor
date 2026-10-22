import {debug} from '@actions/core'
import {compact} from 'lodash/fp'
import packageJson, {FullMetadata} from 'package-json'
import {COMMENT_IDENTIFIER} from '../../config/comment'
import {DependenciesList, Dependency} from '../../types/package'
import resolvePackageName from '../packages/resolvePackageName'
import {getAdvisorPackageScore} from './advisorPackageMetadata'

interface advisorScorePictures {
  [index: string]: string
}

async function draftMessage(
  newDependencies: DependenciesList
): Promise<string> {
  // list all dependencies to render
  const listDependencies = [
    ...newDependencies.dependencies,
    ...newDependencies.devDependencies
  ]

  // fetch information for all dependencies to render
  const info: Record<string, FullMetadata> = {}
  const advisorScorePicture: advisorScorePictures = {}
  for (const dependency of listDependencies) {
    const packageName = resolvePackageName(dependency)
    try {
      info[packageName] = await packageJson(packageName, {fullMetadata: true})
      advisorScorePicture[packageName] = await getAdvisorPackageScore(
        packageName
      )
    } catch (error) {
      debug(`Package not found: ${packageName}`)
    }
  }

  const messageInfo = (dependency: Dependency): string => {
    const dep = resolvePackageName(dependency)
    const title =
      dep === dependency.name ? dep : `${dependency.name} (npm:${dep})`

    // lists the dependency without metadata if the package lookup failed
    if (!info[dep]) {
      return `
### ${title}\n

No package metadata found on the npm registry.
    `
    }

    return `
### ${
      info[dep].homepage
        ? `[${title}](https://snyk.io/advisor/npm-package/${encodeURIComponent(
            info[dep].name
          )})`
        : title
    }\n

<table>
  ${
    info[dep].description
      ? `<tr><td>Description</td><td>${info[dep].description}</td></tr>`
      : ``
  }
  ${
    info[dep].author?.name
      ? `<tr><td>Author</td><td>${info[dep].author?.name}</td></tr>`
      : ``
  }
  ${
    info[dep].license
      ? `<tr><td>License</td><td>${info[dep].license}</td></tr>`
      : ``
  }
  ${
    info[dep].contributors
      ? `<tr><td>Contributors</td><td>${info[dep].contributors
          ?.map(contributor => contributor.name)
          .join(', ')}</td></tr>`
      : ``
  }
  ${
    info[dep].time?.created
      ? `<tr><td>Created on</td><td>${info[dep].time.created}</td></tr>`
      : ``
  }
  ${
    info[dep].time?.modified
      ? `<tr><td>Last modified</td><td>${info[dep].time.modified}</td></tr>`
      : ``
  }
  ${
    advisorScorePicture[dep]
      ? `<tr><td>Snyk Advisor Score</td><td><a href="https://snyk.io/advisor/npm-package/${encodeURIComponent(
          dep
        )}"><img src="${advisorScorePicture[dep]}" /></a></td></tr>`
      : ``
  }
</table>
${
  info[dep].readme
    ? `<details><summary>README.md</summary>${info[dep].readme}</details> `
    : ``
}
    `
  }

  const dependenciesMessage = `
## New dependencies
${newDependencies.dependencies.map(messageInfo).join(`\n`)}
`

  const devDependenciesMessage = `
## New devDevelopment
${newDependencies.devDependencies.map(messageInfo).join(`\n`)}
`

  return compact([
    COMMENT_IDENTIFIER,
    newDependencies.dependencies.length && dependenciesMessage,
    newDependencies.devDependencies.length && devDependenciesMessage
  ]).join(`\n`)
}

export default draftMessage
