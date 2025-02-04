# lexarav2

[Edit in StackBlitz next generation editor ⚡️](https://stackblitz.com/~/github.com/incrhst/lexarav2)

## Deployment to Netlify

You can deploy this application to Netlify in a few simple steps:

1. Fork or clone this repository to your GitHub account
2. Sign up for a Netlify account at https://app.netlify.com
3. Click "New site from Git" in Netlify
4. Choose your repository
5. Configure the build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Configure environment variables in Netlify:
   - VITE_SUPABASE_URL
   - VITE_SUPABASE_ANON_KEY
   - Any other environment variables from your .env file

The application will be automatically deployed and will rebuild on every push to the main branch.

### Continuous Deployment

Netlify automatically sets up continuous deployment. When you push changes to your repository:
1. Netlify detects the changes
2. Builds your application
3. Deploys the new version
4. Handles all routing through the configured redirects

### Preview Deployments

Netlify creates preview deployments for pull requests, allowing you to test changes before merging to main.