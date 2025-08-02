#!/bin/bash

echo "🚀 SMP Deployment Script"
echo "========================"

# Build the project
echo "📦 Building project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo ""
    echo "🌐 Your static files are ready in the 'out' directory"
    echo ""
    echo "Quick deployment options:"
    echo ""
    echo "1. 📤 Upload 'out' folder to any static host (Netlify, Vercel, GitHub Pages)"
    echo "2. 🌍 Use npx serve: cd out && npx serve ."
    echo "3. 🐍 Use Python server: cd out && python -m http.server 8000"
    echo "4. 🟢 Use Node.js server: cd out && npx http-server"
    echo ""
    echo "🔥 Or try the instant deploy commands below:"
    echo ""
    echo "For Netlify Drop: https://app.netlify.com/drop"
    echo "For Vercel: npx vercel --prod"
    echo "For Surge.sh: npm i -g surge && cd out && surge"
    echo ""
    echo "🎮 The score card generator will work perfectly!"
else
    echo "❌ Build failed!"
    exit 1
fi