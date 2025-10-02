# Contributing to Isaks Store

🎉 First off, thanks for taking the time to contribute! 🎉

The following is a set of guidelines for contributing to Isaks Store. These are mostly guidelines, not rules. Use your best judgment, and feel free to propose changes to this document in a pull request.

## 📝 Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

## 🚀 How Can I Contribute?

### 🐛 Reporting Bugs

Before creating bug reports, please check [existing issues](https://github.com/yosephdev/isaks-store/issues) as you might find that the issue has already been reported. When you create a bug report, include as many details as possible:

* Use a clear and descriptive title
* Describe the exact steps to reproduce the problem
* Provide specific examples to demonstrate the steps
* Describe the behavior you observed after following the steps
* Explain which behavior you expected to see instead and why
* Include screenshots or animated GIFs if possible

### 💡 Suggesting Enhancements

If you have a suggestion for improving the project, we'd love to hear it! Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

* A clear and descriptive title
* A detailed description of the proposed functionality
* Any possible drawbacks
* Why this enhancement would be useful

### 🔧 Pull Requests

1. Fork the repo and create your branch from `main`
2. If you've added code that should be tested, add tests
3. Ensure the test suite passes
4. Make sure your code lints
5. Update the documentation if needed

## 💻 Development Process

1. Clone the repository

    ```bash
    git clone https://github.com/yosephdev/isaks-store.git
    ```

1. Install dependencies

    ```bash
    cd isaks-store
    npm run install:all
    ```

1. Create your feature branch

    ```bash
    git checkout -b feature/amazing-feature
    ```

1. Follow our coding standards

    * Use ESLint and Prettier configurations
    * Follow the existing code style
    * Write meaningful commit messages following [Conventional Commits](https://www.conventionalcommits.org/)

1. Test your changes

    ```bash
    npm run test
    npm run lint
    ```

1. Push to your branch

    ```bash
    git push origin feature/amazing-feature
    ```

1. Open a Pull Request

## 🎨 Styleguides

### Git Commit Messages

* Use the present tense ("Add feature" not "Added feature")
* Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
* Limit the first line to 72 characters or less
* Reference issues and pull requests liberally after the first line
* Consider starting the commit message with an applicable emoji:
  * 🎨 `:art:` when improving the format/structure of the code
  * 🐎 `:racehorse:` when improving performance
  * 🚱 `:non-potable_water:` when plugging memory leaks
  * 📝 `:memo:` when writing docs
  * 🐛 `:bug:` when fixing a bug
  * 🔥 `:fire:` when removing code or files
  * 💚 `:green_heart:` when fixing the CI build
  * ✅ `:white_check_mark:` when adding tests
  * 🔒 `:lock:` when dealing with security
  * ⬆️ `:arrow_up:` when upgrading dependencies
  * ⬇️ `:arrow_down:` when downgrading dependencies

### JavaScript Styleguide

* Use modern ES6+ syntax
* Use meaningful variable and function names
* Document complex code sections
* Follow the [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)

### CSS/SCSS Styleguide

* Use TailwindCSS utility classes when possible
* Follow BEM naming convention for custom CSS
* Keep specificity as low as possible

## 📄 License

By contributing, you agree that your contributions will be licensed under its MIT License.
