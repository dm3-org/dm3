#!/bin/bash

# Input file
input_file="dump.txt"

DB_NAME="dm3-storage"
DB_USER="postgres"


# Read the input file line by line
while IFS= read -r line
do
    # Extract the ID (first part of the line) and timestamp (after "createdAt")
    id=$(echo "$line" | cut -d ':' -f 2)
    timestamp=$(echo "$line" | grep -oP '(?<="createdAt":)[0-9]+')

    # Convert the timestamp from milliseconds to seconds
    timestamp_seconds=$(echo $timestamp | sed 's/...$//')

    # Insert the extracted values into the PostgreSQL table
    psql -U $DB_USER -d $DB_NAME -c "INSERT INTO \"Account\" (id, \"createdAt\") VALUES ('$id', to_timestamp($timestamp_seconds));"

done < "$input_file"

