# AI Notes

## Testing Setup
- The `package.json` file includes a `test` script to run the tests using `npm test`.
- A central test runner (`/tests/run-tests.js`) dynamically loads and executes all test files in the `/tests/` directory.

## Running Tests
- Use the command `npm test` to run all tests.
- Add new test files to the `/tests/` directory, and they will automatically be picked up by the test runner.

## Test Output
- The test runner provides attractive output with:
  - Green ticks (`✔`) for passed tests.
  - Red crosses (`✘`) for failed tests.
  - A summary of passed, failed, and total tests.
- Errors for failed tests are displayed in red for easy debugging.
