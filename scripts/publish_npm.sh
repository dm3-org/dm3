#!/bin/bash

# Initialize variables
new_version=""
simulate=false
build=false

# Function to compare version numbers
version_gt() { test "$(printf '%s\n' "$@" | sort -V | head -n 1)" != "$1"; }

# Parse command line arguments
while [[ "$#" -gt 0 ]]; do
    case $1 in
        -v|--version) new_version="$2"; shift ;;
        --simulate) simulate=true ;;
        --build) build=true ;;
        *) echo "Unknown parameter passed: $1"; exit 1 ;;
    esac
    shift
done

# Loop through all directories
find . -type d | while read dir; do
  # Check if both package.json and .export-npm exist
  if [[ -f "$dir/package.json" && -f "$dir/.export-npm" ]]; then
    # Change to the directory
    cd "$dir"

    # Read the package name from package.json
    package_name=$(jq -r '.name' package.json)

    # Get the current version from npm
    current_npm_version=$(npm view "$package_name" version 2>/dev/null)

    # Check if new version is greater than current version
    if [ -n "$new_version" ] && version_gt "$new_version" "$current_npm_version"; then
      target_version=$new_version
    else
      echo "Error: New version $new_version is not greater than current version $current_npm_version."
      exit 1
    fi

    # Build the project if --build is set
    if [ "$build" = true ]; then
      echo "Building project in $dir"
      yarn build
    fi

    # Output the package name and version change
    if [ "$simulate" = true ]; then
      echo "npm simulate: $package_name@$current_npm_version -> $target_version"
    else
      echo "npm publish: $package_name@$current_npm_version -> $target_version"
      jq --arg ver "$target_version" '.version = $ver' package.json > temp.json && mv temp.json package.json
      npm publish --access public
    fi

    # Return to the original directory
    cd - > /dev/null
  fi
done
