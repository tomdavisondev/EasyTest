#!/bin/bash

# List of endpoints to test
endpoints=(
  "https://www.tomdavisondev.com"
  "https://www.google.com"
  "http://easytest.tomdavisondev.com/users/login"
  "http://easytest.tomdavisondev.com"
)

# Email details
email_recipient="tomwilliamdavison@gmail.com"
email_subject="Endpoint Check Failed"

# Loop through each endpoint and test it using curl
for endpoint in "${endpoints[@]}"
do
  # Check if the endpoint requires a POST request
  if [[ "$endpoint" == *"users/login"* ]]; then
    # Send a POST request to the endpoint with email and password fields
    response=$(curl -sS -X POST -d "email=guest@example.com&password=guest" "$endpoint" 2>&1)
  else
    # Send a GET request to the endpoint and output the response
    response=$(curl -sS "$endpoint" 2>&1)
  fi

  if [ $? -eq 0 ]; then
    echo "$endpoint is up"
  else
    echo "$endpoint is down: $response"
    echo -e "Subject:$email_subject\n\n$endpoint is down: $response" | mutt -s "$email_subject" "$email_recipient"
  fi
done
