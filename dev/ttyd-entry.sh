#!/bin/bash

user_name="$1"
if [[ -z "$user_name" ]]; then
	user_name=root
fi

launch_command="${@:2}"

user_entity=$(cat /proc/1/root/etc/passwd | awk -F: "\$1 == \"$1\" {print \$0}")
if [[ -z "$user_entity" ]]; then
   echo "unknown user: $1"

   #echo
   #echo Valid users:
   #cat /proc/1/root/etc/passwd | awk -F: '{print $1}'

   exit 1
fi

user_uid=$(echo $user_entity | awk -F: '{print $3}')
user_gid=$(echo $user_entity | awk -F: '{print $4}')
user_home=$(echo $user_entity | awk -F: '{print $6}')

HOME="$user_home" \
	nsenter -t 1 -m -u -i -n -S 0 -G 0 -r"/proc/1/root" -w"/proc/1/root" \
	/bin/sh -c nsenter -t 1 -m -u -i -n -S "$user_uid" -G "$user_gid" -r"/proc/1/root" -w"/proc/1/root$user_home" \
	$launch_command

exit $?
