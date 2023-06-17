@echo off

:: ttyd
docker run --rm -it ^
  -p 7681:7681 ^
  -v "%~dp0ttyd-entry.sh:/root/entry.sh" ^
  -v "/:/root/host" ^
  tsl0922/ttyd ttyd ^
    --writable ^
    --port 7681 ^
    --client-option disableLeaveAlert=true ^
    --client-option disableReconnect=true ^
    --url-arg ^
      -- bash -e /root/entry.sh
