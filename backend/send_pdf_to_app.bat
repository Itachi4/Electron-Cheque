@echo off
REM Usage: send_pdf_to_app.bat "C:\path\to\file.pdf"
set LOGFILE=%~dp0upload_log.txt
echo [STEP 1] Batch file started. >> "%LOGFILE%"
set PDF_FILE=%~1
echo [STEP 2] PDF_FILE is: %PDF_FILE% >> "%LOGFILE%"
echo [STEP 3] Running Node.js upload script... >> "%LOGFILE%"
where node >> "%LOGFILE%" 2>&1
node "%~dp0upload_pdf.js" "%PDF_FILE%" >> "%LOGFILE%" 2>&1
echo [STEP 4] Node.js script finished. >> "%LOGFILE%"