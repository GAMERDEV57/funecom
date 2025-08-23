# 🚀 FunEcom Deployment Guide

## Overview
FunEcom is a full-stack e-commerce platform built with:
- **Frontend**: React + Vite + TailwindCSS
- **Backend**: Convex (Database + Auth + Real-time)
- **Deployment**: Netlify (Frontend) + Convex (Backend)

## 🔧 Environment Setup

### Required Environment Variables
Your app needs these environment variables to connect to the Convex backend:

```env
VITE_CONVEX_URL=https://hardy-starling-491.convex.cloud
```

## 📋 Deployment Steps

### 1. GitHub Repository Setup
1. Create a new repository on GitHub
2. Clone this project or upload the files
3. Push to your GitHub repository

### 2. Netlify Deployment
1. Go to [Netlify](https://netlify.com) and sign in
2. Click "New site from Git"
3. Connect your GitHub repository
4. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
5. Add environment variables in Netlify:
   - Go to Site settings → Environment variables
   - Add: `VITE_CONVEX_URL` = `https://hardy-starling-491.convex.cloud`
6. Deploy!

### 3. Custom Domain (Optional)
1. In Netlify, go to Domain settings
2. Add your custom domain
3. Configure DNS settings as instructed

## 🔐 Authentication & Backend

### Convex Backend
- **Deployment**: `hardy-starling-491`
- **Dashboard**: https://dashboard.convex.dev/d/hardy-starling-491
- **Features**: Real-time database, authentication, file storage

### Authentication
- Username/password authentication via Convex Auth
- User profiles with addresses and order history
- Store owner capabilities

## 🛠️ Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Deploy Convex functions (if needed)
npx convex deploy
```

## 📱 Features

### For Buyers
- Browse marketplace with real-time updates
- Product search and filtering
- Secure checkout with multiple payment options
- Order tracking and history
- Invoice generation

### For Sellers
- Create and manage stores
- Add/edit products with image uploads
- Order management dashboard
- Real-time notifications
- Sales analytics

### Platform Features
- Zero platform fees
- Real-time updates
- Secure file storage
- Mobile responsive design
- Professional invoicing

## 🔧 Configuration Files

- `netlify.toml` - Netlify build configuration
- `vite.config.ts` - Vite build configuration
- `convex/` - Backend functions and schema
- `tailwind.config.js` - Styling configuration

## 📞 Support

For deployment issues:
- Check Netlify build logs
- Verify environment variables
- Ensure Convex deployment is active
- Contact support if needed

## 🎯 Production Checklist

- [ ] Environment variables configured
- [ ] Custom domain set up (optional)
- [ ] SSL certificate active
- [ ] Build successful
- [ ] Authentication working
- [ ] Database connections active
- [ ] File uploads working
- [ ] Payment integration tested

---

**FunEcom** - Connecting Buyers & Sellers Nationwide 🛒
