export const dedupeAnonymous = (classes) =>
  Array.from(
    classes.reduce((map, obj) => (obj.name !== 'Anonymous' ? map.set(obj.name, obj) : map), new Map()).values()
  );

export const refineClasses = (classes, metadataMap) => {
  const classMap = new Map(classes.map((c) => [c.name, c]));

  classes.forEach((cls) => {
    const correctedParents = [];
    cls.parents.forEach((pName) => {
      if (metadataMap.get(pName) === 'interface') {
        if (!cls.implements.includes(pName)) cls.implements.push(pName);
      } else {
        correctedParents.push(pName);
      }
    });
    cls.parents = correctedParents;
    cls.children = [];
  });

  classes.forEach((cls) => {
    const allBaseTypes = [...cls.parents, ...cls.implements];
    allBaseTypes.forEach((baseName) => {
      const baseClass = classMap.get(baseName);
      if (baseClass && !baseClass.children.includes(cls.name)) {
        baseClass.children.push(cls.name);
      }
    });
  });

  return [...classes];
};

