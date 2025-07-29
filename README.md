# Scandium GitHub Actions Integration

This repository demonstrates how to integrate Scandium automated testing with GitHub Actions CI/CD pipeline.

## Overview

This setup allows you to:
- Automatically run Scandium tests on every push to the main branch
- Manually trigger test runs from the GitHub Actions UI
- View test results directly in GitHub Actions logs

## Setup Instructions

### Step 1: Configure GitHub Secrets

1. Navigate to your repository on GitHub
2. Go to **Settings > Secrets and variables > Actions > Repository secrets**
3. Add the following required secrets:

| Secret Name | Description | Required |
|-------------|-------------|----------|
| `API_TOKEN` | Your Scandium API token | ✅ Yes |
| `PROJECT_ID` | Your Scandium project ID | ✅ Yes |
| `SUITE_ID` | Your Scandium test suite ID | ✅ Yes |
| `HUB_URL` | Selenium Grid URL (if using custom infrastructure) | ❌ No |
| `STARTING_URL` | Override URL for all tests in the suite | ❌ No |

### Step 2: Workflow Configuration

The workflow file `.github/workflows/run-scandium.yml` is already configured with:

- **Triggers**: Runs on push to `main` branch and manual dispatch
- **Environment**: Ubuntu latest runner
- **Browser**: Chrome
- **Screenshots**: Enabled
- **Retry Logic**: 30 max attempts with 120-second wait periods

### Step 3: Usage

#### Automatic Execution
Push any changes to the `main` branch to automatically trigger the workflow.

#### Manual Execution
1. Go to your repository on GitHub
2. Click the **Actions** tab
3. Select `Run Scandium Script`
4. Click **Run workflow**

## Configuration Options

You can modify the following environment variables in the workflow:

- `BROWSER`: Browser to use (default: chrome)
- `SCREENSHOT`: Enable/disable screenshots (default: true)
- `VARIABLES`: JSON string for test variables (default: '{}')
- `RETRY`: Number of retry attempts (default: 0)
- `MAX_ATTEMPTS`: Maximum polling attempts (default: 30)
- `WAIT_PERIOD`: Seconds between polling attempts (default: 120)

## Troubleshooting

| Problem | Solution |
|---------|----------|
| ❌ `Missing required variable` | Double-check that `API_TOKEN`, `PROJECT_ID`, and `SUITE_ID` are set correctly |
| ❌ `Script not found or not executable` | Ensure the script URL is valid and has execution permission |
| 🕒 `Stuck waiting` | Adjust `WAIT_PERIOD` and `MAX_ATTEMPTS` in the environment variables |

## Files

- `.github/workflows/run-scandium.yml` - GitHub Actions workflow configuration
- `README.md` - This documentation file

## Resources

- [Scandium Documentation](https://docs.getscandium.com/integrations/github-actions)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)