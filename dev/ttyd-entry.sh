#!/bin/bash

chroot --groups="$2" --userspec="$1:$1" /mnt/host/ ${@:3}
