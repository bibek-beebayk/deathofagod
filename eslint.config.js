export default [
  {
    files: ["map/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: Object.fromEntries(
        [
          "THREE",
          "window",
          "document",
          "atob",
          "devicePixelRatio",
          "innerWidth",
          "innerHeight",
          "addEventListener",
          "setTimeout",
          "performance",
          "requestAnimationFrame",
        ].map((name) => [name, "readonly"]),
      ),
    },
    rules: {
      "no-undef": "error",
      "no-import-assign": "error",
      "no-dupe-args": "error",
      "no-unreachable": "error",
    },
  },
];
