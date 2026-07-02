# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

# IMPORTANT RULES

1. don't add code comments.
2. Always browse the web to get the latest information
3. Always use query params on the frontend since we are using NextJs out dir with Ionic.
4. Always use shadcn colors and components.
5. Pages and components should be powered by props at all times for easy unit testing.
6. All pages must be added to the components dir and must be broken down into smaller reusable components. Ex components/pages/profile-page/.
7. Make sure the UI is beautiful using shadcn colors.
8. Make sure pages and sections always have thier skeleton loading component.
9. This is a mobile app, so the header, body or footer to look like that of a mobile app.
10. Periodically review all the documents in the documentations folder for changes and implement the changes.
11. Only implement what has been instructed.

# Component Design

1. Each component must be powered by props and shouldn't make it's own API calls internally Ex <ProfilePage isLoading={true} error={false} data={} onProfileChange={() =>{}} /> or <LoginForm isLoading onSubmitLogin={() =>{}}  />
2. Always use the composer pattern.
3. Make sure all forms use production grade shadcn form validation.

