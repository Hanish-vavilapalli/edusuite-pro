@echo off
echo Switching/Creating branch feature/dynamic-faculty-roster...
git checkout -b feature/dynamic-faculty-roster 2>nul
git checkout feature/dynamic-faculty-roster

echo Staging all changes...
git add .

echo Committing all changes...
git commit -m "feat: implement semester constraints, scheduled flat exam fees, dynamic taught sections, and database registrations sync"

echo Pushing all changes to remote branch...
git push origin feature/dynamic-faculty-roster

echo Done!
pause
