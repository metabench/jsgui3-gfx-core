const path = require('path');
const fs = require('fs');

// ANSI escape codes for colored output
const colors = {
    blue: '\x1b[34m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    bold: '\x1b[1m',
    reset: '\x1b[0m',
};

// Get all test files in the /tests/ directory
const testDir = __dirname;
const testFiles = fs.readdirSync(testDir)
    .filter(file => file.endsWith('.test.js') && file !== 'run-tests.js')
    .sort();

let totalFiles = 0;
let passedTests = 0;
let failedTests = 0;

// Run each test file
testFiles.forEach(testFile => {
    console.log(`${colors.blue}Running ${testFile}...${colors.reset}`);
    try {
        const testResults = require(path.join(testDir, testFile))();
        if (!testResults || !Number.isInteger(testResults.passed) || !Number.isInteger(testResults.failed)) {
            throw new TypeError(`${testFile} did not return integer passed/failed counts`);
        }
        passedTests += testResults.passed;
        failedTests += testResults.failed;
        if (testResults.failed === 0) {
            console.log(`${colors.green}✔ All tests passed in ${testFile}${colors.reset}`);
        } else {
            console.log(`${colors.red}✘ ${testResults.failed} test(s) failed in ${testFile}${colors.reset}`);
        }
    } catch (err) {
        console.log(`${colors.red}✘ Tests failed in ${testFile}${colors.reset}`);
        console.error(`${colors.red}${err}${colors.reset}`);
        failedTests++;
    }
    totalFiles++;
});

// Summary
console.log(`\n${colors.bold}Test Summary:${colors.reset}`);
console.log(`${colors.green}✔ Passed: ${passedTests}${colors.reset}`);
console.log(`${colors.red}✘ Failed: ${failedTests}${colors.reset}`);
console.log(`${colors.yellow}Cases: ${passedTests + failedTests}${colors.reset}`);
console.log(`${colors.yellow}Files: ${totalFiles}${colors.reset}`);

if (failedTests > 0) {
    process.exit(1); // Exit with error code if any test fails
}
