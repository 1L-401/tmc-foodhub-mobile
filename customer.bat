@echo off
setlocal EnableExtensions EnableDelayedExpansion

set "AVD_NAME=Pixel_9"
set "WORKSPACE_DIR=%~dp0"
set "ANDROID_SDK=%LOCALAPPDATA%\Android\Sdk"
set "EMULATOR=%ANDROID_SDK%\emulator\emulator.exe"
set "ADB=%ANDROID_SDK%\platform-tools\adb.exe"
set "APP_START_CMD="

where pnpm >nul 2>&1
if not errorlevel 1 (
    set "APP_START_CMD=pnpm --filter @tmc/customer-app android"
)

if not defined APP_START_CMD (
    where corepack >nul 2>&1
    if not errorlevel 1 (
        set "APP_START_CMD=corepack pnpm --filter @tmc/customer-app android"
    )
)

if not defined APP_START_CMD (
    echo Neither pnpm nor corepack was found on PATH.
    echo Install pnpm, or ensure corepack is available from your Node installation.
    exit /b 1
)

if not exist "%EMULATOR%" (
    echo Emulator executable not found:
    echo %EMULATOR%
    exit /b 1
)

if not exist "%ADB%" (
    echo adb executable not found:
    echo %ADB%
    exit /b 1
)

set "DEVICE_SERIAL="

for /f "skip=1 tokens=1,2" %%A in ('"%ADB%" devices') do (
    if "%%B"=="device" (
        set "CANDIDATE=%%A"
        if /I "!CANDIDATE:~0,9!"=="emulator-" (
            set "DEVICE_SERIAL=%%A"
            goto emulator_ready
        )
    )
)

echo No running emulator detected. Starting %AVD_NAME%...

set "AVD_EXISTS="
for /f "delims=" %%A in ('"%EMULATOR%" -list-avds') do (
    if /I "%%A"=="%AVD_NAME%" set "AVD_EXISTS=1"
)

if not defined AVD_EXISTS (
    echo AVD "%AVD_NAME%" was not found.
    echo Run "%EMULATOR%" -list-avds and update AVD_NAME in this file.
    exit /b 1
)

start "Android Emulator (%AVD_NAME%)" "%EMULATOR%" -avd "%AVD_NAME%" -netdelay none -netspeed full

echo Waiting for emulator to connect...
"%ADB%" -e wait-for-device >nul 2>&1

for /f "skip=1 tokens=1,2" %%A in ('"%ADB%" devices') do (
    if "%%B"=="device" (
        set "CANDIDATE=%%A"
        if /I "!CANDIDATE:~0,9!"=="emulator-" (
            set "DEVICE_SERIAL=%%A"
            goto emulator_ready
        )
    )
)

if not defined DEVICE_SERIAL (
    echo Emulator connected but serial could not be detected.
    exit /b 1
)

:emulator_ready
echo Using emulator: !DEVICE_SERIAL!
echo Waiting for Android boot to complete...
"%ADB%" -s "!DEVICE_SERIAL!" wait-for-device >nul 2>&1
set "BOOT="
for /f %%B in ('"%ADB%" -s "!DEVICE_SERIAL!" shell getprop sys.boot_completed 2^>nul') do (
    set "BOOT=%%B"
)
if not "!BOOT!"=="1" (
    echo Android is still finishing boot. Continuing anyway...
)

echo Starting customer app in a new terminal...
echo Applying Expo doctor bypass for Node 24 compatibility.
start "Customer App (Expo)" cmd /k "cd /d ""%WORKSPACE_DIR%"" && set EXPO_NO_DOCTOR=1 && set EXPO_DOCTOR_SKIP_DEPENDENCY_VERSION_CHECK=1 && %APP_START_CMD%"

echo Clearing old logs...
"%ADB%" -s "!DEVICE_SERIAL!" logcat -c

echo Streaming logcat now. Press Ctrl+C in this window to stop.
"%ADB%" -s "!DEVICE_SERIAL!" logcat

endlocal