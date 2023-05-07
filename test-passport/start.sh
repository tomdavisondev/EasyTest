#!/bin/bash

while true; do
  # Run npm start and append output to a timestamped file
  npm start >> "$(date +"%Y%m%d_%H%M%S").txt" 2>&1

  # Wait for 5 seconds before checking if process is still running
  sleep 20

  # Check if the process is still running
  if ! pgrep -x "node" > /dev/null; then
    echo "StartScript: npm start process has stopped. Restarting..."
  else
    echo "StartScript: npm start process is still running."
  fi
done