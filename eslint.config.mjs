import globals from "globals";


export default [
  // {files: ["**/*.js"], languageOptions: {sourceType: "commonjs"}},
  {languageOptions: { globals: globals.browser },
  
  rules:{
    'quotes':['warn','single'],
    'semi':['warn','never'],
    'no-unused-vars': ['warn', { 'vars': 'local' }],
    'no-var':['error']
  },
  ignores: [
    '/node_modules/**',
    '/dist/**',
    '/build/**',
    '/coverage/**',
    '/.env',
  ],

  },
];