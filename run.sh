#!/bin/bash
set -e

BUILD_NAME="resume_ai"

docker build -t $BUILD_NAME .
docker run -p 3000:3000" $BUILD_NAME"