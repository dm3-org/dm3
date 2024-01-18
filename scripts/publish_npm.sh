#!/bin/bash

# Initialize variables
new_version=""
simulate=false
build=false
update=false

# Path to the directory containing your packages
packages_dir="packages"

# Function to compare version numbers
version_gt() { test "$(printf '%s\n' "$@" | sort -V | head -n 1)" != "$1"; }

# Parse command line arguments
while [[ "$#" -gt 0 ]]; do
    case $1 in
        -v|--version) new_version="$2"; shift ;;
        -s|--simulate) simulate=true ;;
        -b|--build) build=true ;;
        -u|--update) update=true ;;  
        *) echo "Unknown parameter passed: $1"; exit 1 ;;
    esac
    shift
done

# Update and install dependencies if --update or -u is set
if [ "$update" = true ]; then
    echo "Updating repository and installing dependencies..."
    git pull
    yarn install
fi

# Build the project if --build or -b is set
if [ "$build" = true ]; then
  echo "Building project..."
  yarn build
fi

# Loop through all directories in the packages directory, excluding node_modules
find "$packages_dir" -type d -name "node_modules" -prune -o -type f -name "package.json" -print | while read package_json; do
  dir=$(dirname "$package_json")

  # Change to the directory
  cd "$dir"

  # Read the publish property from package.json
  publish=$(jq -r '.publish' package.json)

  # Check if publish is true
  if [[ "$publish" == "true" ]]; then
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

    # Output the package name and version change
    if [ "$simulate" = true ]; then
      echo "npm simulate: $package_name@$current_npm_version -> $target_version"
    else
      echo "npm publish: $package_name@$current_npm_version -> $target_version"
      jq --arg ver "$target_version" '.version = $ver' package.json > temp.json && mv temp.json package.json
      yarn npm publish --access public
    fi
  fi

  # Return to the original directory
  cd - > /dev/null
done
