// pnpm hook configuration - compatible with Dependabot
module.exports = {
  hooks: {
    readPackage(pkg) {
      // Handle null/undefined packages (important for Dependabot)
      if (!pkg || typeof pkg !== 'object') {
        return pkg || {}
      }
      
      // Ensure pkg.name exists before checking
      if (pkg.name === 'esbuild' && pkg.scripts && pkg.scripts.postinstall) {
        // Remove esbuild's postinstall script to avoid issues
        delete pkg.scripts.postinstall
      }
      
      return pkg
    }
  }
}