@echo off
ECHO --- Starting MYB Cheque Processor Script ---

REM The full path to your final, packaged Electron application
set "ELECTRON_APP_PATH=C:\Users\Sravani\Desktop\electron-app-printer\Electron-Cheque\dist\win-unpacked\electronPrinting.exe"

REM The full path to the PDF file passed from PDFCreator
set "PDF_FILE=%~1"

ECHO.
ECHO Received PDF file:
ECHO %PDF_FILE%
ECHO.
ECHO Electron App Path:
ECHO %ELECTRON_APP_PATH%
ECHO.

ECHO Launching application...

REM The command to start your Electron app and pass it the file path
start "" "%ELECTRON_APP_PATH%" "%PDF_FILE%"

ECHO.
ECHO --- Script Finished ---
ECHO This window will now close.

REM We add a small delay so you can see the output before it closes.
timeout /t 5 >nul