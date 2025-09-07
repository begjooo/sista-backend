export function combinePsqlMongo(psql, mongo) {
  const mergedMap = new Map();

  psql.forEach((item) => {
    mergedMap.set(item.username, { ...item });
  });

  mongo.forEach((item) => {
    if (mergedMap.has(item._id)) {
      mergedMap.set(item._id, { ...mergedMap.get(item._id), ...item });
    } else {
      mergedMap.set(item._id, { ...item });
    };
  });

  return Array.from(mergedMap.values());
};