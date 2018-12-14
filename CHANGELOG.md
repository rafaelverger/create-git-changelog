# CHANGELOG

## 0.2.0
- [FIX #21] Handle semver beta versions.
- [FIX #20] Fix sort versions method.
- [FIX #19] Fix indentation on changelog.
- [FIX #13] Add arg to cli to use only tagged commits.
- Avoid split rule splitting its own commit patches
  Related #16
- Forcing tag info to show on commits list
- Allow useTag parameter to only get version from tagged commits.
  Related to #13
- Update parser to get commit's tags
- [FIX #17] Improve regex to identify issue numbers.
- [FIX #15] Fix changelogs with only unpublished changes.
- [FIX #16] Fix extraction of commit's first line.
- [FIX #14] Remove unnecessary files from pkg.
- [FIX #12] Create bin file.

## 0.1.0
- [FIX #9] Integrate with coveralls.
- Add tests to create script
- Create gitignore
- Ignoring messages on commits that only updates pkg version
- Add more tests to parseCommit with resolved issues
- Impoving generator script
- [FIX #7] Using new info to filter significant commits.
- Enhancing change infos while parsing commits. rel #7
- Add wercker badge to README
- [FIX #3] Using wercker as CI.
- [FIX #4] Build changes using commits msg and grouped by version.
- [FIX #1] Create method to parse commit text.

## 0.0.0
- Add package.json
- Initial commit
