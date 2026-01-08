export default {
  'no-hex-colors': {
    meta: {
      type: 'problem',
      docs: {
        description: 'Disallow hex color codes outside of src/styles/index.css',
        category: 'Best Practices'
      },
      messages: {
        noHexColors: 'Hex color codes are only allowed in src/styles/index.css. Use Tailwind classes or CSS variables instead.'
      }
    },
    create(context) {
      // Only run this rule if we're NOT in the global styles file
      const filename = context.getFilename();
      if (filename.endsWith('src/styles/index.css')) {
        return {};
      }

      const hexColorRegex = /#[0-9A-Fa-f]{3,8}\b/g;

      return {
        // Because regular strings ('#FF0000') and template strings (`#FF0000`)
        // are different node types in the AST, 
        // we need to check both to catch all hex colors.
        Literal(node) {
          const value = node.value;
          if (typeof value === 'string' && hexColorRegex.test(value)) {
            context.report({
              node,
              messageId: 'noHexColors'
            });
          }
        },
        TemplateElement(node) {
          const value = node.value.raw;
          if (hexColorRegex.test(value)) {
            context.report({
              node,
              messageId: 'noHexColors'
            });
          }
        }
      };
    }
  }
};