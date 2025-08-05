This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Conventional Commits

This project uses conventional commits to maintain a clean and standardized commit history. The setup includes:

- **Commitizen**: Interactive commit message builder
- **Commitlint**: Validates commit messages against conventional commit standards
- **Husky**: Git hooks to enforce commit standards

### How to Commit

Instead of using `git commit`, use the interactive commitizen:

```bash
pnpm run commit
# or
npx cz
```

This will guide you through creating a conventional commit message with:
- Type of change (feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert, wip, security, deps)
- Scope (optional)
- Short description
- Longer description (optional)
- Breaking changes (optional)
- Issues affected (optional)

### Commit Types

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code (white-space, formatting, etc)
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `build`: Changes that affect the build system or external dependencies
- `ci`: Changes to CI configuration files and scripts
- `chore`: Other changes that don't modify src or test files
- `revert`: Reverts a previous commit
- `wip`: Work in progress
- `security`: Security fixes
- `deps`: Dependency updates

### Examples

```bash
feat: add user authentication system
fix: resolve login form validation issue
docs: update API documentation
style: format code according to style guide
refactor: simplify user service logic
perf: optimize database queries
test: add unit tests for user service
build: update webpack configuration
ci: add GitHub Actions workflow
chore: update dependencies
```
