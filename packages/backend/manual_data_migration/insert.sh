#!/bin/bash

# Input file
input_file="dump.txt"

# PostgreSQL connection details
DB_HOST="localhost"
DB_PORT="5432"
DB_NAME="dm3-storage"
DB_USER="postgres"
DB_PASSWORD="postgres"

# Export password to avoid password prompt
export PGPASSWORD=$DB_PASSWORD

# Read the input file line by line
while IFS= read -r line
do
    # Extract the ID (first part of the line) and timestamp (after "createdAt")
    id=$(echo "$line" | cut -d ':' -f 2)
    timestamp=$(echo "$line" | grep -oP '(?<="createdAt":)[0-9]+')

    # Convert the timestamp from milliseconds to seconds
    timestamp_seconds=$(echo "scale=0; $timestamp / 1000" | bc)

    # Insert the extracted values into the PostgreSQL table
    psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "INSERT INTO \"Account\" (id, \"createdAt\") VALUES ('$id', to_timestamp($timestamp_seconds));"
    #echo "INSERT INTO Account (id, timestamp) VALUES ('$id', $timestamp);"
done < "$input_file"

# Unset the password variable for security reasons
unset PGPASSWORD
