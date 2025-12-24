{
  description = "Quick Amazon Search - Chromium extension development environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
      in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            # Node.js and package management (latest stable)
            nodejs

            # Browser for testing (optional, you likely have Brave installed)
            # chromium
          ];

          shellHook = ''
            echo "🦁 Quick Amazon Search - Development Environment"
            echo "Node version: $(node --version)"
            echo "npm version: $(npm --version)"
            echo ""
            echo "Ready to build your Chrome/Brave extension!"
          '';
        };
      }
    );
}

