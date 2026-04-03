# 🚀 LEARNX Frontend - Quick Reference

**Status**: ✅ **FIXED AND WORKING**

## ⚡ Start in 10 Seconds

```bash
cd c:\Users\ranad\OneDrive\Desktop\LEARNX
.\run-frontend.ps1
```

**Result**: Frontend running on http://localhost:3000

---

## 📋 Available Commands

### Development
```bash
.\run-frontend.ps1          # Start dev server
```

### Production
```bash
.\run-frontend.ps1 -Build   # Build for production
.\run-frontend.ps1 -Prod    # Run production build
```

### Quality Checks
```bash
cd web
npm run typecheck           # Check TypeScript
npm run lint                # Check code style
npm test                    # Run tests
```

### Direct npm (from web folder)
```bash
cd web
npm run dev                 # Dev server
npm run build               # Production build
npm start                   # Run production
```

---

## 🎯 What Was Fixed

✅ **Build Script Issue** - Fixed `web/scripts/build-next.js` path resolution  
✅ **Startup Script Issue** - Fixed `start-learnx.ps1` directory handling  
✅ **New Launcher** - Created `run-frontend.ps1` for reliable launching  

---

## 🌐 Frontend URLs

- **Development**: http://localhost:3000
- **API**: https://learnx-production-3bf1.up.railway.app/api/v1

---

## 📚 Documentation

- `FRONTEND_FIX_SUMMARY.md` - Complete fix details
- `START_HERE.md` - Overall project guide
- `LAPTOP_IMPORT_COMPLETE.md` - Setup guide

---

## ✨ That's It!

Your frontend is fixed and ready to use. Run `.\run-frontend.ps1` to start developing!
