#!/bin/bash

MY_UID="$(id -u)" MY_GID="$(id -g)" docker compose --file ./dev/docker-compose.yml --project-name home-pie up
