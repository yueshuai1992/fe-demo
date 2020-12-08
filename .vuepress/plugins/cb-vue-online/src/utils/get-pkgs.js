import parsePackageName from 'parse-package-name';
const unpkg = 'https://unpkg.com/'
export default async function(code, imports, scripts) {
  console.log(imports);
  const replacements = [];
  for (const [index, item] of imports.entries()) {
    if(item.module.includes('.json')) {
      const url = item.module.replace('~public/', '/')
      let xhr = new XMLHttpRequest();
      xhr.open('GET', url, false);
      xhr.overrideMimeType("text/html;charset=utf-8");//默认为utf-8
      xhr.send(null);
      const data = `var ${item.variables[0].local} = ${xhr.responseText} \n`
      replacements.push(data);
    } else {
      const moduleName = `__npm_module_${index}`;
      const pkg = parsePackageName(item.module);
      const version = pkg.version || 'latest';

      scripts.push({
        path: pkg.path ? `/${pkg.path}` : '',
        name: moduleName,
        module:
          pkg.name === 'vue' && !pkg.path
            ? `vue@${version}/dist/vue.esm.js`
            : `${pkg.name}@${version}`
      });

      let replacement = '\n';
      
      /* for (const variable of item.variables) {
        if (variable.imported === 'default') {
          replacement += `var ${
            variable.local
          } = ${moduleName}.default || ${moduleName};\n`;
        } else {
          replacement += `var ${variable.local} = ${moduleName}.${
            variable.imported
          };\n`;
        }
      } */
      if (replacement) {
        replacements.push(replacement);
      }
    } 
  }
  
  if (replacements.length > 0) {
    code = replacements.join('\n') + code;
  }

  return code;
}
