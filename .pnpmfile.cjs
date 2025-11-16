// Allow esbuild to run its postinstall script
module.exports = {
  hooks: {
    readPackage(pkg) {
      if (pkg.name === 'esbuild') {
        // Allow esbuild to run its postinstall script
        delete pkg.scripts.postinstall
      }
      return pkg
    }
  }
}