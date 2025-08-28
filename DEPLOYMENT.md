# 🚀 Deployment Guide for GitHub Activity Tracker

**Break the Rules, Own Your Code** - Deploy like a rebel! 

## Prerequisites

- [Vercel Account](https://vercel.com) (free tier works great)
- [GitHub Personal Access Token](https://github.com/settings/tokens)
- Git repository connected to your Vercel account

## 🔧 Quick Deploy to Vercel

### Option 1: One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/github-activity)

### Option 2: Manual Deployment

1. **Fork/Clone this repository**
   ```bash
   git clone https://github.com/yourusername/github-activity.git
   cd github-activity
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   - Copy `env.example` to `.env.local`
   - Get your GitHub Personal Access Token from [GitHub Settings](https://github.com/settings/tokens)
   - Required scopes: `read:user`, `repo` (for public repositories)
   ```bash
   cp env.example .env.local
   # Edit .env.local and add your GITHUB_TOKEN
   ```

4. **Test locally**
   ```bash
   npm run dev
   ```
   Visit http://localhost:3000 to verify everything works

5. **Deploy to Vercel**
   ```bash
   npx vercel
   ```
   Follow the prompts to deploy

## 🔑 Environment Variables

Set these environment variables in your Vercel project dashboard:

| Variable | Description | Required |
|----------|-------------|----------|
| `GITHUB_TOKEN` | Your GitHub Personal Access Token | ✅ Yes |
| `NODE_ENV` | Set to `production` for production builds | Optional |

### Setting Environment Variables in Vercel

1. Go to your project dashboard on [Vercel](https://vercel.com/dashboard)
2. Navigate to **Settings** → **Environment Variables**
3. Add `GITHUB_TOKEN` with your personal access token
4. Deploy or redeploy your project

## 📊 GitHub Personal Access Token Setup

1. Go to [GitHub Settings → Developer settings → Personal access tokens](https://github.com/settings/tokens)
2. Click **Generate new token (classic)**
3. Set expiration (recommend 1 year for production apps)
4. Select these scopes:
   - ✅ `read:user` - Read user profile information
   - ✅ `repo` - Access to public repositories (for language stats)
5. Copy the token immediately (you won't see it again!)
6. Add it to your Vercel environment variables

## 🛠️ Build Configuration

The project is pre-configured for optimal Vercel deployment:

- **Framework**: Next.js 15.5.2 with App Router
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm ci`
- **Functions**: API routes with 30s timeout
- **Caching**: Aggressive caching for GitHub API responses

## 🏗️ Project Structure

```
github-activity/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── [username]/         # Dynamic user pages
│   │   ├── api/github/         # GitHub API endpoints
│   │   └── layout.tsx          # Root layout
│   ├── components/             # React components
│   │   ├── charts/             # Chart components
│   │   └── skeletons/          # Loading components
│   ├── lib/                    # Utility functions
│   └── types/                  # TypeScript types
├── public/                     # Static assets
├── vercel.json                 # Vercel configuration
├── next.config.ts              # Next.js configuration
└── package.json                # Dependencies
```

## 🚦 Performance Optimizations

- **API Caching**: 5-minute cache with 10-minute stale-while-revalidate
- **Image Optimization**: Next.js Image component for GitHub avatars
- **Code Splitting**: Automatic with Next.js App Router
- **Bundle Analysis**: Use `npm run build` to see bundle sizes
- **Security Headers**: CSP, CSRF protection, XSS prevention

## 🔍 Monitoring & Analytics

### Built-in Monitoring
- **Vercel Analytics**: Automatically enabled
- **Error Logging**: Console logs in Vercel Functions tab
- **Performance**: Core Web Vitals tracking

### GitHub API Rate Limits
- **Unauthenticated**: 60 requests/hour per IP
- **With Token**: 5,000 requests/hour
- **GraphQL**: 5,000 points/hour (different from REST)

Monitor your usage in the [GitHub API Rate Limit dashboard](https://docs.github.com/en/rest/overview/resources-in-the-rest-api#rate-limiting).

## 🐛 Troubleshooting

### Common Issues

**1. "GitHub token is required" error**
- Ensure `GITHUB_TOKEN` is set in Vercel environment variables
- Verify the token has correct scopes (`read:user`, `repo`)
- Check token hasn't expired

**2. "User not found" error**
- Verify the GitHub username is correct
- Check if the user profile is public

**3. "API rate limit exceeded"**
- You've hit GitHub's rate limit
- Wait for the reset (shown in error message)
- Consider implementing request queuing for high-traffic apps

**4. Build failures**
- Check Vercel build logs in the Functions tab
- Ensure all dependencies are in `package.json`
- Verify TypeScript types are correct

### Debug Mode

Set `NODE_ENV=development` to enable detailed error messages in API responses.

## 🔧 Custom Domain Setup

1. **Add Domain in Vercel**
   - Go to Project Settings → Domains
   - Add your custom domain
   - Follow DNS configuration instructions

2. **SSL Certificate**
   - Automatically provisioned by Vercel
   - Usually takes 5-10 minutes

## 📈 Scaling Considerations

- **Database**: Currently uses GitHub API directly (stateless)
- **Caching**: Consider Redis for high-traffic applications
- **CDN**: Vercel Edge Network handles this automatically
- **Geographic Distribution**: Deploy to multiple regions if needed

## 🎯 Production Checklist

- [ ] GitHub Personal Access Token configured
- [ ] Environment variables set in Vercel
- [ ] Custom domain configured (optional)
- [ ] Analytics enabled
- [ ] Error monitoring set up
- [ ] Performance tested with real GitHub usernames
- [ ] Rate limiting considered for high traffic

## 🆘 Support

If you run into issues:

1. Check [Vercel Documentation](https://vercel.com/docs)
2. Review [GitHub API Documentation](https://docs.github.com/en/rest)
3. Check the [Next.js Documentation](https://nextjs.org/docs)
4. Create an issue in this repository

---

**Ready to deploy? Let's break the rules and show the world your code! 🔥**
