import packageJson from 'package-json'
import analyseAllPackages from '../src/modules/packages/analyseAllPackages'
import getLocalPackageInfo from '../src/modules/packages/getLocalPackageInfo'
import manageMessage from '../src/modules/message/manageMessage'

const mockGitHubClient = {
  getBaseBranch: jest.fn(),
  getPackage: jest.fn(),
  fetchMessage: jest.fn(),
  setMessage: jest.fn()
}

jest.mock('../src/services/github-sdk', () => ({
  __esModule: true,
  default: {getClient: () => mockGitHubClient}
}))
jest.mock('../src/modules/packages/getLocalPackageInfo', () => ({
  __esModule: true,
  default: jest.fn()
}))
jest.mock('../src/modules/message/advisorPackageMetadata', () => ({
  getAdvisorPackageScore: jest.fn()
}))
jest.mock('package-json', () => jest.fn())

const mockPackageJson = (packageJson as unknown) as jest.Mock
const mockGetLocalPackageInfo = getLocalPackageInfo as jest.MockedFunction<
  typeof getLocalPackageInfo
>

// yoavain/create-windowless-app#2464 adds npm aliases to its devDependencies:
// `typescript` already exists in the base branch, `@typescript/typescript6` is new
test('reports only the packages new to the base branch', async () => {
  mockGitHubClient.getPackage.mockResolvedValue({
    dependencies: {},
    devDependencies: {typescript: '6.0.3'}
  })
  mockGetLocalPackageInfo.mockResolvedValue({
    dependencies: {},
    devDependencies: {
      '@typescript/native': 'npm:typescript@7.0.2',
      typescript: 'npm:@typescript/typescript6@6.0.2'
    }
  })
  mockPackageJson.mockImplementation(async (name: string) => {
    if (name !== '@typescript/typescript6') {
      throw new Error(`${name} could not be found`)
    }
    return {name, homepage: 'https://www.typescriptlang.org/'}
  })

  await manageMessage(await analyseAllPackages(['package.json']))

  expect(mockPackageJson.mock.calls).toEqual([
    ['@typescript/typescript6', {fullMetadata: true}]
  ])
  expect(mockGitHubClient.setMessage.mock.calls[0][0]).toContain(
    '### [typescript (npm:@typescript/typescript6)](https://snyk.io/advisor/npm-package/%40typescript%2Ftypescript6)'
  )
})

test('lists a new package missing from the registry', async () => {
  mockGitHubClient.getPackage.mockResolvedValue({
    dependencies: {},
    devDependencies: {}
  })
  mockGetLocalPackageInfo.mockResolvedValue({
    dependencies: {},
    devDependencies: {'not-on-registry': '^1.0.0'}
  })
  mockPackageJson.mockRejectedValue(new Error('not-on-registry not found'))

  await manageMessage(await analyseAllPackages(['package.json']))

  const message = mockGitHubClient.setMessage.mock.calls[0][0]
  expect(message).toContain('### not-on-registry')
  expect(message).toContain('No package metadata found on the npm registry.')
})
