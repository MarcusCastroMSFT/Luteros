// eslint-disable-next-line @typescript-eslint/no-require-imports
const results = require('/tmp/lint-full.json');
const fixable = [
  '@typescript-eslint/no-unused-vars',
  'react-hooks/exhaustive-deps',
  'import/no-anonymous-default-export',
];
results.forEach(f => {
  f.messages.forEach(m => {
    if (fixable.includes(m.ruleId)) {
      const path = f.filePath.replace('C:\\Luteros\\', '').replace(/\\/g, '/');
      console.log(path + ':' + m.line + ':' + m.column + ' [' + m.ruleId + '] ' + m.message.slice(0, 80));
    }
  });
});
