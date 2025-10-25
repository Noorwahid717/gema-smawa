# 🐍 Python Coding Lab - Quick Start Guide

## Setup Judge0 API

### 1. Get API Key from RapidAPI
1. Visit: https://rapidapi.com/judge0-official/api/judge0-ce
2. Click "Subscribe to Test"
3. Choose "Basic" plan (FREE - 50 requests/day)
4. Copy your **X-RapidAPI-Key**

### 2. Configure Environment
Add to your `.env` file:
```bash
JUDGE0_API_URL=https://judge0-ce.p.rapidapi.com
JUDGE0_API_KEY=your-rapidapi-key-here
```

### 3. Run Database Migration
```bash
npx prisma generate
npx prisma migrate dev
```

### 4. Seed Sample Tasks
```bash
npx ts-node seed/seed-python-coding-lab.ts
```

## Access the Feature

### Student View:
1. Login as student
2. Navigate to: `/student/python-coding-lab`
3. Browse tasks
4. Click task to open editor
5. Write code and submit!

### Available Routes:
- **Task List:** `/student/python-coding-lab`
- **Task Detail:** `/student/python-coding-lab/[slug]`
- **API Docs:** See `docs/PYTHON-CODING-LAB-COMPLETE.md`

## Sample Tasks Included:
1. ✅ Hello World (Easy)
2. ✅ Penjumlahan Dua Bilangan (Easy)
3. ✅ FizzBuzz (Medium)
4. ✅ Palindrome Checker (Medium)
5. ✅ Faktorial Rekursif (Hard)

## Features:
- 💻 Monaco Code Editor
- ✅ Auto Grading
- 🧪 Multiple Test Cases
- 📊 Score Tracking
- 💡 Hints System
- 📱 Responsive Design
- 🌙 Dark Mode

## Tech Stack:
- **Judge0 API** - Code execution
- **Monaco Editor** - Professional code editor
- **PostgreSQL** - Database
- **Next.js 15** - Full-stack framework
- **TypeScript** - Type safety

## Need Help?
Read full documentation: `docs/PYTHON-CODING-LAB-COMPLETE.md`
