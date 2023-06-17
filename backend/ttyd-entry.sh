#!/bin/bash

chroot --groups="$2" --userspec="$1:$1" /root/host/ ${@:3}
