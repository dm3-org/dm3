#!/bin/bash

echo "Build script executing......."

# Finds all the files of type CSS from all directories & sub directories in src folder
allFilesPath=`find ./src -type f -name '*.css'`

# Loop through all the CSS files and paste them in proper location
for filePath in $allFilesPath ;
  do
    # File path without esm directory :- Ex : styles/common.css
    buildFilePath=${filePath#*/*/}

    # =========== ESM ===========
    # File path with esm folder as prefix :- Ex : ./build/esm/styles/common.css
    exactFilePath="./lib/esm/$buildFilePath"

    # The directoy path to create :- Ex : ./build/esm/styles
    directoryToCreate="./lib/esm/${buildFilePath%/*}" 

    # Create the directory if it not exists :- Ex : ./build/esm/styles
    mkdir -p $directoryToCreate

    # Copy the file :- Ex : Copies file from ./src/styles/common.css to ./build/esm/styles/common.css
    cp -R $filePath $exactFilePath

    # =========== CJS ===========
    # File path with cjs folder as prefix :- Ex : ./build/cjs/styles/common.css
    exactFilePathCjs="./lib/cjs/$buildFilePath"

    # The directoy path to create :- Ex : ./build/cjs/styles
    directoryToCreateCjs="./lib/cjs/${buildFilePath%/*}"

    # Create the directory if it not exists :- Ex : ./build/cjs/styles
    mkdir -p $directoryToCreateCjs

    # Copy the file :- Ex : Copies file from ./src/styles/common.css to ./build/cjs/styles/common.css
    cp -R $filePath $exactFilePathCjs

  done

# Copy all the assets from src and paste it into the build
cp -r ./src/assets ./lib/esm/ && cp -r ./src/assets ./lib/cjs/

echo "Copied all CSS files : $allFilesPath"
echo "Copied assets folder"
echo "Build created successfully......."