@echo off
echo Creating branch feature/dynamic-faculty-roster...
git checkout -b feature/dynamic-faculty-roster

echo Staging changes...
git add edusuite-frontend/src/routes/faculty.evaluation-and-marks.tsx
git add edusuite-backend/src/modules/exams/exams.routes.ts

echo Committing changes...
git commit -m "feat: implement dynamic taught sections and database-backed student roster for faculty evaluations"

echo Pushing branch to origin...
git push origin feature/dynamic-faculty-roster

echo Done!
pause
