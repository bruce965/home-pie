#!/bin/bash

cd /app

echo Configuring Go path...
export GOCACHE=/app/.go-cache

echo Installing gow...
go install github.com/mitranim/gow@87df6e48eec654d4e4dfa9ae4c9cdb378cb3796b

echo Starting server...
gow -r=false run .
