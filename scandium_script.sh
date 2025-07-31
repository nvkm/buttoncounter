#!/bin/bash


# Check if jq is installed, and install it if not
if ! command -v jq &> /dev/null; then
  echo "jq is not installed. Installing jq..."
  
  # Determine the package manager based on the OS
  if [ -f /etc/debian_version ]; then
    # Debian-based systems (e.g., Ubuntu)
    apt-get update && apt-get install -y jq
  elif [ -f /etc/redhat-release ]; then
    # Red Hat-based systems (e.g., CentOS, Fedora)
    yum install -y jq
  else
    echo "Unsupported operating system. Please install jq manually."
    exit 1
  fi
  
  # Verify installation
  if ! command -v jq &> /dev/null; then
    echo "Failed to install jq. Exiting..."
    exit 1
  fi
  
  echo "jq installed successfully."
fi

# Configuration variables (must be provided as environment variables or command-line arguments)
API_TOKEN="${API_TOKEN}"
PROJECT_ID="${PROJECT_ID}"
SUITE_ID="${SUITE_ID}"
BASE_URL="${BASE_URL:-https://scr.getscandium.com}"
BROWSER="${BROWSER:-chrome}"
SCREENSHOT="${SCREENSHOT:-true}"

# Set VARIABLES to null if not provided
VARIABLES="${VARIABLES:-}"
if [ -z "$VARIABLES" ]; then
  VARIABLES="{}"  # Use actual null (not string "null") if the variable is not set
fi

RETRY="${RETRY:-0}"
MAX_ATTEMPTS="${MAX_ATTEMPTS:-30}"
WAIT_PERIOD="${WAIT_PERIOD:-120}"  # Time in seconds between polling attempts
HUB_URL="${HUB_URL:-null}"
STARTING_URL="${STARTING_URL:-null}"

# Check for required variables and throw an error if any are missing
if [ -z "$API_TOKEN" ]; then
  echo "Error: API_TOKEN must be set as environment variables or passed as arguments."
  exit 1
fi

if [ -z "$PROJECT_ID" ]; then
  echo "Error: PROJECT_ID must be set as environment variables or passed as arguments."
  exit 1
fi

if [ -z "$SUITE_ID" ]; then
  echo "Error: SUITE_ID must be set as environment variables or passed as arguments."
  exit 1
fi

# Build the JSON body dynamically based on defined variables
body="{\"project_id\": \"$PROJECT_ID\", \"suite_id\": \"$SUITE_ID\", \"browser\": \"$BROWSER\", \"screenshot\": $SCREENSHOT, \"strategy\": \"callback\", \"variables\": $VARIABLES, \"retry\": $RETRY"

# Add properties to the body only if they are defined
if [ -n "$HUB_URL" ] && [ "$HUB_URL" != "null" ]; then
  body="$body, \"hub_url\": \"$HUB_URL\""
fi

if [ -n "$STARTING_URL" ] && [ "$STARTING_URL" != "null" ]; then
  body="$body, \"starting_url\": \"$STARTING_URL\""
fi

# Close the JSON body
body="$body}"

# Print out the body for debugging purposes
echo "Request body: $body"

# Make the initial API request and capture the response
response=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -H "x-api-token: $API_TOKEN" \
  -d "$body" \
  "$BASE_URL/suites/execute")

# Print raw response for debugging
echo "Raw API response: $response"

# Check if the response is valid JSON
if ! echo "$response" | jq empty; then
  echo "Error: Received invalid JSON response from the API."
  echo "Response: $response"
  exit 1
fi

# Extract execution IDs and initialize a JSON array to store them
execution_ids=$(echo "$response" | jq -c '.executions | map(.execution_id)')
if [ "$execution_ids" == "null" ] || [ -z "$execution_ids" ]; then
  echo "Error: No execution IDs found in the response."
  echo "Response: $response"
  exit 1
fi
echo "Execution IDs: $execution_ids"

# Remove brackets and convert execution_ids to a space-separated list
execution_id_list=$(echo "$execution_ids" | sed 's/[][]//g' | tr ',' ' ')
echo "Formatted execution IDs for processing: $execution_id_list"

# Poll for Each Execution Status
attempt=0
all_completed=false
final_statuses=()
final_results=()

while [ "$all_completed" = "false" ] && [ $attempt -lt $MAX_ATTEMPTS ]; do
  all_completed=true
  final_statuses=()  # Reset final statuses in each iteration
  final_results=()   # Reset final results in each iteration
  echo "Polling attempt #$(( attempt + 1 ))"

  # Iterate over each parsed execution ID
  for id in $execution_id_list; do
    id=$(echo "$id" | sed 's/^"\(.*\)"$/\1/')
    
    echo "Polling execution ID: $id"

    # Make API request with execution ID
    response=$(curl -s -X GET \
      -H "Content-Type: application/json" \
      -H "x-api-token: $API_TOKEN" \
      -H "Cache-Control: no-cache, no-store, must-revalidate" \
      -H "Pragma: no-cache" \
      -H "Expires: 0" \
      "$BASE_URL/suites/executions?execution_id=$id&project_id=$PROJECT_ID")

    # Check if the response is valid JSON
    if ! echo "$response" | jq empty; then
      echo "Error: Received invalid JSON response for execution ID $id."
      echo "Response: $response"
      exit 1
    fi

    echo "Raw response for execution ID $id: $response"

    running_status=$(echo "$response" | jq -r '.data.running_status')
    status=$(echo "$response" | jq -r '.data.status')
    echo "Execution ID $id - Running Status: $running_status, Final Status: $status"

    if [ "$running_status" != "completed" ]; then
      all_completed=false
    else
      # Save the final result for this execution
      echo "$response" > "execution_result_${id}.json"
      final_results+=("execution_result_${id}.json")
    fi

    final_statuses+=("$status")
  done

  if [ "$all_completed" = "false" ]; then
    echo "Waiting before the next polling attempt..."
    sleep $WAIT_PERIOD  # Wait before the next polling attempt
  fi
  attempt=$(( attempt + 1 ))
done

# Check if we exited due to exceeding max attempts
if [ "$all_completed" = "false" ]; then
  echo "Not all executions completed within the timeout period."
  echo "TIMEOUT" > test_result.txt
  exit 1
else
  echo "All executions completed. Final statuses: ${final_statuses[@]}"
fi

# Check Final Statuses
all_successful=true

for status in "${final_statuses[@]}"; do
  if [ "$status" == "error" ]; then
    all_successful=false
    echo "An execution has failed."
    break
  fi
done

if [ "$all_successful" = "false" ]; then
  echo "One or more executions have failed."
  echo "FAILED" > test_result.txt
  exit 1
else
  echo "All executions completed successfully."
  echo "PASSED" > test_result.txt
fi