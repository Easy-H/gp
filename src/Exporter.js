export const toMermaid = (classes, direction = 'TB') => {
  if (!classes || classes.length === 0) return '';
  const vis = (v) => {
    if (v === 'private') return '-';
    if (v === 'protected') return '#';
    if (v === 'internal') return '~';
    return '+';
  };

  let script = 'classDiagram\n';
  script += `    direction ${direction}\n`;
  // Mermaid 문법 안전을 위해 큰따옴표를 제거하고 시작 부분의 언더바(_)를 삭제합니다.
  const clean = (str) => {
    if (!str) return '';
    // 1. 시작 부분의 모든 언더바 제거 2. 영문/숫자/_ 이외의 문자를 _로 치환
    return str.replace(/^_+/, '').replace(/[^\w]/g, '_');
  };

  classes.forEach(cls => {
    const cName = clean(cls.name);
    const stereotype = cls.type === 'interface' ? ' <<interface>>' : '';
    // Mermaid에서는 모두 class로 선언하되 스테레오타입으로 구분하는 것이 가장 안정적입니다.
    script += `    class ${cName}${stereotype} {\n`;
    cls.fields.forEach(f => {
      const name = typeof f === 'string' ? f : f.name;
      const type = typeof f === 'object' && f.type ? ` : ${clean(f.type)}` : '';
      const v = vis(f.visibility);
      script += `        ${v}${clean(name)}${type}\n`;
    });
    cls.methods.forEach(m => {
      const name = typeof m === 'string' ? m : m.name;
      const type = typeof m === 'object' && m.type ? ` : ${clean(m.type)}` : '';
      const v = vis(m.visibility);
      script += `        ${v}${clean(name)}()${type}\n`;
    });
    script += `    }\n`;
    if (cls.parents) {
      cls.parents.forEach(p => { script += `    ${clean(p)} <|-- ${cName}\n`; });
    }
    if (cls.implements) {
      cls.implements.forEach(i => { script += `    ${clean(i)} <|.. ${cName}\n`; });
    }
    if (cls.associations) {
      cls.associations.forEach(({ target, label, relationType }) => {
        // 포함 관계는 *-- , 연관 관계는 --> 사용
        const symbol = (relationType === 'composition') ? '*--' : '-->';
        const labelPart = label ? ` : ${clean(label)}` : '';
        script += `    ${cName} ${symbol} ${clean(target)}${labelPart}\n`;
      });
    }
  });
  return script;
};

export const toPlantUML = (classes) => {
  if (!classes || classes.length === 0) return '';
  const vis = (v) => {
    if (v === 'private') return '-';
    if (v === 'protected') return '#';
    if (v === 'internal') return '~';
    return '+';
  };

  let script = '@startuml\n';
  classes.forEach(cls => {
    const type = cls.type || 'class';
    script += `${type} ${cls.name} {\n`;
    cls.fields.forEach(f => {
      const name = typeof f === 'string' ? f : f.name;
      script += `  ${vis(f.visibility)}${name}\n`;
    });
    cls.methods.forEach(m => {
      const name = typeof m === 'string' ? m : m.name;
      script += `  ${vis(m.visibility)}${name}()\n`;
    });
    script += `}\n`;
    if (cls.parents) {
      cls.parents.forEach(p => { script += `${p} <|-- ${cls.name}\n`; });
    }
    if (cls.implements) {
      cls.implements.forEach(i => { script += `${i} <|.. ${cls.name}\n`; });
    }
    if (cls.associations) {
      cls.associations.forEach(({ target, label }) => {
        const labelPart = label ? ` : ${label}` : '';
        script += `${cls.name} --> ${target}${labelPart}\n`;
      });
    }
  });
  script += '@enduml';
  return script;
};

export const toDOT = (classes) => {
  if (!classes || classes.length === 0) return '';
  const vis = (v) => {
    if (v === 'private') return '-';
    if (v === 'protected') return '#';
    if (v === 'internal') return '~';
    return '+';
  };

  let script = 'digraph G {\n  node [shape=record];\n';
  classes.forEach(cls => {
    const fields = cls.fields.map(f => {
      const name = typeof f === 'string' ? f : f.name;
      return `${vis(f.visibility)}${name}`;
    }).join('\\l');
    const methods = cls.methods.map(m => {
      const name = typeof m === 'string' ? m : m.name;
      return `${vis(m.visibility)}${name}()`;
    }).join('\\l');

    const stereotype = cls.type === 'interface' ? '«interface»\\n' : '';
    script += `  ${cls.name} [label="{${stereotype}${cls.name}|${fields}\\l|${methods}\\l}"];\n`;
    if (cls.parents) {
      cls.parents.forEach(p => { script += `  ${p} -> ${cls.name} [arrowhead=empty];\n`; });
    }
    if (cls.implements) {
      cls.implements.forEach(i => { script += `  ${i} -> ${cls.name} [style=dashed, arrowhead=empty];\n`; });
    }
    if (cls.associations) {
      cls.associations.forEach(({ target, label }) => {
        const labelPart = label ? ` [label="${label}"]` : '';
        script += `  ${cls.name} -> ${target}${labelPart};\n`;
      });
    }
  });
  script += '}';
  return script;
};