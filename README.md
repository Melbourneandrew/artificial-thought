## Simple Blog with Next.js and Supabase as CMS
This is a simple blog starter kit built with Supabase and Next.js.

While you can use this as a blog out of the box, it's designed to be extended and customized.
Posts are uploaded as markdown files, and are stored in a blog_posts table in Supabase.

### Getting Started

1. Clone this repository
2. Run the setup script:
   ```bash
   npm i && npm run setup
   ```

The setup script will:
- Create a `.env` file from the template
- Prompt you for basic blog configuration:
  - Blog title
  - Blog description
  - Author name
- Start a local Supabase instance
- Configure your Supabase credentials automatically
- Run database migrations
- Create an admin user for the blog management interface

During setup, you'll be prompted to:
1. Enter your blog details
2. Create an admin account by providing:
   - Email address
   - Password (or let the system generate one)

After setup completes, you'll receive:
- Supabase Dashboard URL for database management
- Admin login credentials for the blog interface
- Confirmation that all migrations have been applied

Keep your admin credentials safe - you'll need them to access the blog management interface.
Note: Public user signups are disabled by default. The only way to create a user account is through the initial setup script. This is a security measure to ensure that only authorized administrators can access the blog management interface.

Navigate to the blog management interface at `http://localhost:3000/admin` to start creating and managing blog posts.