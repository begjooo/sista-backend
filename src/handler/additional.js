export function combinePsqlAndMongodb(psql, mongo) {
  const mergedMap = new Map();

  psql.forEach((item) => {
    mergedMap.set(item.username, { ...item });
  });

  console.log(mergedMap);

  mongo.forEach((item) => {
    if (mergedMap.has(item._id)) {
      mergedMap.set(item._id, { ...mergedMap.get(item._id), ...item });
    } else {
      mergedMap.set(item._id, { ...item });
    };
  });

  console.log(mergedMap);

  return Array.from(mergedMap.values());
};