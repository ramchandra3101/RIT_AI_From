{ pkgs }: {
  deps = [
    pkgs.nodejs-18_x
    pkgs.nodePackages.npm
    pkgs.yarn
    pkgs.replitPackages.jest
  ];
}
