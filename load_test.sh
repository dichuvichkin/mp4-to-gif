#!/bin/bash

TOTAL_REQUESTS=1000
CONCURRENT_REQUESTS=50
URL="http://localhost:3000/upload"
ORIGINAL_FILE="test_video.mp4"

echo "🚀 Starting Load Test: $TOTAL_REQUESTS Requests, $CONCURRENT_REQUESTS Concurrent..."

send_request() {
    local request_id=$1
    local temp_file="test_video_${request_id}.mp4"

    # Create a copy of the original file with a unique name
    cp "$ORIGINAL_FILE" "$temp_file"

    # Send request with the unique file
    curl -s -o /dev/null -w "%{http_code} %{time_total}s\n" -X POST "$URL" -F "video=@$temp_file"

    # Remove the temporary file after upload
    rm -f "$temp_file"
}

for ((i=0; i<TOTAL_REQUESTS; i++)); do
    send_request $i &  # Run in background
    if (( (i+1) % CONCURRENT_REQUESTS == 0 )); then
        wait  # Wait after every batch
    fi
done

wait  # Ensure all requests finish
echo "✅ Load Test Completed!"
