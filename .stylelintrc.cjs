module.exports = {
  extends: [
    'stylelint-config-html',
    'stylelint-config-recommended-scss',
    'stylelint-config-recommended-vue/scss'
  ],
  overrides: [
    {
      files: [
        '**/*.vue',
        '**/*.scss'
      ],
      rules: {
        'unit-disallowed-list': [
          ['rem', 'em'],
        ],
        // Only allow @kong/design-tokens or `--kong-ui-*` CSS custom properties
        'custom-property-pattern': [
          "^(kui-).+$",
          {
            message: "Expected custom property \"%s\" to be sourced from @kong/design-tokens with prefix '--kui-'",
          }
        ],
        // Disable the following rules
        'custom-property-no-missing-var-function': null,
        'no-descending-specificity': null,
      }
    }
  ],
  plugins: [
    'stylelint-order',
    '@kong/design-tokens/stylelint-plugin',
  ],
  rules: { 'order/properties-alphabetical-order': true }
}
