export default {
  id: 'da315607-4d04-4a54-810d-45156b575932',
  // eslint-disable-next-line no-template-curly-in-string
  content: "# Markdown UI\n\nA markdown renderer and edit UI.\n\n## Formatting types\n\n### Code block and inline code\n\n```typescript\n/**\n * Combine a first name and last name into a single string.\n * @param {string} firstName - The first name.\n * @param {string} lastName - The last name.\n * @returns {string} The combined full name.\n */\nconst combineNames = (firstName: string, lastName: string): string => {\n  return `${firstName} ${lastName}`\n}\n\nconst name = combineNames('Marty', 'McFly')\n\nconsole.log(name)\n\n// Marty McFly\n```\n\nThis sentence has `inlineCode` in the middle.\n\n### Emoji\n\n:smile: :rocket: :tada:\n\n### Link\n\n[link](https://github.com)\n\n### Tables\n\n| Column1 | Column2 | Column3 |\n| :--- | :--- | :--- |\n| Content | Content | Content |\n\n### Todo items\n\n- [x] Todo item checked\n- [ ] Another item not checked\n\n---\n\n### Diagrams\n\n#### Mermaid\n\n```mermaid\ngitGraph\n   commit\n   commit\n   branch develop\n   checkout develop\n   commit\n   commit\n   checkout main\n   merge develop\n   commit\n   commit\n```\n\n#### Plantuml\n\n```plantuml\nBob -> Alice : hello\n```\n\n#### DOT\n\n```dot\ndigraph example1 {\n    1 -> 2 -> { 4, 5 };\n    1 -> 3 -> { 6, 7 };\n}\n```\n",
  parent_document_id: null,
  slug: 'markdown',
  title: 'markdown',
}
