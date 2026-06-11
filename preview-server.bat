@echo off
setlocal
cd /d "E:\opencode work\FS\G005-RISv-3.0.0"
call npx vite preview --port 4173 --host 127.0.0.1 --strictPort > "%TEMP%\opencode\preview-final.log" 2>&1
