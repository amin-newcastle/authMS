module.exports = {
  presets: [
    [
      '@babel/preset-env',
      { targets: { node: 'current' }, modules: 'commonjs' },
    ],
    ['@babel/preset-typescript', { allowDeclareFields: true }],
  ],
  plugins: [
    function jsToTsImports() {
      return {
        visitor: {
          ImportDeclaration(path) {
            const source = path.node.source.value;
            if (
              typeof source === 'string' &&
              source.endsWith('.js') &&
              (source.startsWith('./') || source.startsWith('../'))
            ) {
              path.node.source.value = source.replace(/\.js$/, '.ts');
            }
          },
        },
      };
    },
  ],
};
