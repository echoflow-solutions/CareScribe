# Contributing to CareScribe

Thank you for your interest in contributing to CareScribe! We welcome contributions from the community to help improve NDIS incident reporting for everyone.

## 🤝 How to Contribute

### 1. Fork the Repository
- Fork the repository to your GitHub account
- Clone your fork locally:
  ```bash
  git clone https://github.com/yourusername/carescribe.git
  cd carescribe/carescribe-demo
  ```

### 2. Create a Branch
- Create a new branch for your feature or fix:
  ```bash
  git checkout -b feature/your-feature-name
  # or
  git checkout -b fix/issue-description
  ```

### 3. Make Your Changes
- Follow the coding standards (see below)
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

### 4. Test Your Changes
- Run the test suite:
  ```bash
  npm run test
  npm run lint
  npm run build
  ```
- Test the application locally:
  ```bash
  npm run dev
  ```

### 5. Submit a Pull Request
- Push your changes to your fork
- Create a pull request to the main repository
- Provide a clear description of your changes
- Reference any related issues

## 📋 Coding Standards

### TypeScript
- Use TypeScript for all new code
- Define proper types and interfaces
- Avoid using `any` type
- Use strict mode

### React/Next.js
- Use functional components with hooks
- Follow React best practices
- Keep components small and focused
- Use proper prop types

### Styling
- Use Tailwind CSS classes
- Follow the existing design system
- Ensure responsive design
- Test on multiple screen sizes

### Code Style
```typescript
// Good example
export function ReportCard({ report }: { report: Report }) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  return (
    <Card className="p-4">
      {/* Component content */}
    </Card>
  )
}
```

### Commit Messages
- Use clear, descriptive commit messages
- Follow conventional commits format:
  ```
  feat: add voice transcription support
  fix: resolve date formatting issue
  docs: update API documentation
  style: format code with prettier
  refactor: simplify report generation logic
  test: add unit tests for AI service
  chore: update dependencies
  ```

## 🧪 Testing

### Unit Tests
- Write tests for new functions and components
- Aim for good test coverage
- Use Jest and React Testing Library

### E2E Tests
- Add Cypress tests for critical user flows
- Test accessibility features
- Verify AI integrations work correctly

## 📚 Documentation

### Code Documentation
- Add JSDoc comments for complex functions
- Document component props
- Explain complex logic

### README Updates
- Update README for new features
- Keep installation instructions current
- Document new environment variables

## 🐛 Reporting Issues

### Before Submitting
- Check existing issues for duplicates
- Try to reproduce with latest version
- Gather relevant information

### Issue Template
```markdown
**Description**
Clear description of the issue

**Steps to Reproduce**
1. Go to...
2. Click on...
3. See error

**Expected Behavior**
What should happen

**Actual Behavior**
What actually happens

**Environment**
- Browser: 
- OS: 
- Node version: 
- Package version: 
```

## 🚀 Feature Requests

### Guidelines
- Explain the use case
- Describe the proposed solution
- Consider alternatives
- Think about NDIS compliance

### Feature Template
```markdown
**Problem**
What problem does this solve?

**Solution**
How would you solve it?

**Alternatives**
Other approaches considered

**Additional Context**
Any other relevant information
```

## 🔒 Security

### Reporting Security Issues
- DO NOT open public issues for security vulnerabilities
- Email security concerns to: security@carescribe.com.au
- Include detailed information about the vulnerability

### Security Best Practices
- Never commit sensitive data
- Use environment variables for secrets
- Validate all user inputs
- Follow OWASP guidelines

## 🎯 Areas for Contribution

### High Priority
- Accessibility improvements
- Performance optimizations
- Additional AI provider integrations
- Mobile responsiveness enhancements

### Feature Ideas
- Offline support
- Multiple language support
- Advanced analytics
- Integration with NDIS systems

### Documentation
- API documentation
- User guides
- Video tutorials
- Architecture diagrams

## 💬 Communication

### Discord
Join our Discord server for discussions: [discord.gg/carescribe]

### GitHub Discussions
Use GitHub Discussions for:
- Feature ideas
- General questions
- Community support

## 🙏 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project website

## 📜 Code of Conduct

### Our Standards
- Be respectful and inclusive
- Welcome newcomers
- Accept constructive criticism
- Focus on what's best for the community

### Unacceptable Behavior
- Harassment or discrimination
- Trolling or insulting comments
- Public or private harassment
- Publishing private information

## 🚦 Release Process

1. Features are developed in feature branches
2. PRs are reviewed by maintainers
3. Changes are merged to develop branch
4. Releases are cut from develop to main
5. Semantic versioning is used

## ❓ Questions?

Feel free to:
- Open a GitHub Discussion
- Join our Discord
- Email: contribute@carescribe.com.au

Thank you for helping make CareScribe better for the NDIS community! 🎉