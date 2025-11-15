# Contributing to Vertimage

Thank you for your interest in contributing to Vertimage! This document provides guidelines and information for contributors.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Contributing Process](#contributing-process)
- [Code Guidelines](#code-guidelines)
- [Testing](#testing)
- [Documentation](#documentation)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)
- [Security](#security)
- [Community](#community)

## Code of Conduct

This project and everyone participating in it is governed by our commitment to creating a welcoming environment for everyone. Please be respectful and constructive in all interactions.

## Getting Started

### Prerequisites

- Node.js 20.x (check [.nvmrc](.nvmrc) for exact version)
- pnpm 8.x
- Git

### Development Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/yourusername/vertimage.git
   cd vertimage
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Start development server**
   ```bash
   pnpm run dev
   ```

4. **Verify setup**
   ```bash
   pnpm run lint
   pnpm run build
   ```

## Contributing Process

### 1. Planning

- Check existing [issues](https://github.com/yourusername/vertimage/issues) and [discussions](https://github.com/yourusername/vertimage/discussions)
- For major changes, open an issue first to discuss the approach
- Look for issues labeled `good first issue` if you're new to the project

### 2. Development Workflow

1. Create a feature branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes following our [code guidelines](#code-guidelines)

3. Test your changes:
   ```bash
   pnpm run lint
   pnpm run build
   ```

4. Commit with conventional commits:
   ```bash
   git commit -m "feat: add new image processing algorithm"
   ```

5. Push and create a pull request

### 3. Commit Convention

We use [Conventional Commits](https://conventionalcommits.org/). Format: `type(scope): description`

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `perf`: Performance improvements

**Examples:**
```bash
git commit -m "feat(ui): add dark mode toggle"
git commit -m "fix(processing): handle edge case in image analysis"
git commit -m "docs: update API documentation"
```

## Code Guidelines

### TypeScript

- Use TypeScript strict mode
- Prefer interfaces over types for object shapes
- Use meaningful variable and function names
- Add JSDoc comments for public APIs

```typescript
/**
 * Processes an image with the specified drone coverage algorithm
 * @param image - The image to process
 * @param options - Processing options
 * @returns Promise resolving to processed image data
 */
export async function processImage(
  image: ImageData,
  options: ProcessingOptions
): Promise<ProcessedImage> {
  // Implementation
}
```

### React Components

- Use functional components with hooks
- Prefer composition over inheritance
- Keep components focused and single-purpose
- Use proper prop types

```typescript
interface ImageViewerProps {
  image: ProcessedImage;
  onUpdate?: (image: ProcessedImage) => void;
}

export function ImageViewer({ image, onUpdate }: ImageViewerProps) {
  // Implementation
}
```

### Styling

- Use Tailwind CSS for styling
- Follow mobile-first responsive design
- Maintain consistent spacing and typography
- Use CSS custom properties for theming

### File Organization

```
src/
├── components/          # Reusable UI components
├── features/           # Feature-specific components and logic
├── hooks/              # Custom React hooks
├── lib/                # Utility functions and modules
├── stores/             # State management (Zustand)
├── types/              # TypeScript type definitions
└── utils/              # Helper functions
```

## Testing

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage
```

### Writing Tests

- Write tests for all new features and bug fixes
- Use descriptive test names
- Follow the Arrange-Act-Assert pattern
- Mock external dependencies

```typescript
describe('processImage', () => {
  it('should process image with default options', async () => {
    // Arrange
    const mockImage = createMockImage();
    const options = { algorithm: 'default' };

    // Act
    const result = await processImage(mockImage, options);

    // Assert
    expect(result).toBeDefined();
    expect(result.processed).toBe(true);
  });
});
```

## Documentation

### Code Documentation

- Add JSDoc comments for all public APIs
- Document complex algorithms and business logic
- Include examples in documentation

### README Updates

- Keep README.md up to date with new features
- Update installation and usage instructions
- Add screenshots for UI changes

### API Documentation

- Document all public interfaces
- Include request/response examples
- Update OpenAPI specs if applicable

## Pull Request Process

### Before Submitting

1. **Ensure CI passes locally**:
   ```bash
   pnpm run lint
   pnpm run build
   pnpm test
   ```

2. **Update documentation** if needed

3. **Add or update tests** for your changes

4. **Follow the PR template** when creating your pull request

### PR Requirements

- [ ] Descriptive title and description
- [ ] Link to related issue(s)
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No merge conflicts
- [ ] All CI checks passing

### Review Process

1. **Automated checks** must pass (CI, security scans, quality gates)
2. **Code review** by maintainers
3. **Manual testing** if UI changes
4. **Approval** and merge

## Issue Reporting

### Bug Reports

Use the [Bug Report template](.github/ISSUE_TEMPLATE/bug_report.yml):

- Provide clear reproduction steps
- Include browser/environment details
- Add screenshots if applicable
- Check for existing similar issues

### Feature Requests

Use the [Feature Request template](.github/ISSUE_TEMPLATE/feature_request.yml):

- Describe the problem you're solving
- Explain your proposed solution
- Consider implementation complexity
- Discuss user impact

### Performance Issues

Use the [Performance Issue template](.github/ISSUE_TEMPLATE/performance_issue.yml):

- Include performance metrics
- Describe system specifications
- Provide steps to reproduce
- Attach profiling data if available

## Security

### Reporting Security Issues

- **Never** report security vulnerabilities in public issues
- Use [GitHub Security Advisories](https://github.com/yourusername/vertimage/security/advisories/new)
- Follow our [Security Policy](SECURITY.md)

### Security Best Practices

- Never commit secrets or API keys
- Use environment variables for sensitive configuration
- Follow OWASP guidelines
- Keep dependencies updated

## Development Tools

### Recommended VS Code Extensions

```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "ms-playwright.playwright",
    "ms-vscode.test-adapter-converter"
  ]
}
```

### Git Hooks

Pre-commit hooks are automatically installed to:
- Run linting
- Check for secrets
- Validate commit messages
- Run type checking

## Release Process

Releases are automated through GitHub Actions:

1. **Create release PR** with version bump and changelog
2. **Merge to main** triggers build and deployment
3. **GitHub Release** is created automatically
4. **Deployment** to GitHub Pages occurs automatically

## Community

### Getting Help

- 💬 [GitHub Discussions](https://github.com/yourusername/vertimage/discussions) - Questions and community chat
- 🐛 [Issues](https://github.com/yourusername/vertimage/issues) - Bug reports and feature requests
- 📧 Email: contributors@yourdomain.com

### Recognition

Contributors are recognized in:
- README.md contributors section
- Release notes
- GitHub contributors graph
- Special recognition for significant contributions

## Style Guides

### Git Branch Naming

- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring
- `chore/description` - Maintenance tasks

### File Naming

- Use kebab-case for file names: `image-processor.ts`
- Use PascalCase for component files: `ImageViewer.tsx`
- Use camelCase for utility files: `imageUtils.ts`

## Questions?

Don't hesitate to ask questions! We're here to help:

- Open a [discussion](https://github.com/yourusername/vertimage/discussions)
- Comment on relevant issues
- Reach out to maintainers

Thank you for contributing to Vertimage! 🚁📸