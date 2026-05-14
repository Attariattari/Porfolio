/**
 * Optimized Mongoose Document Serialization
 * Converts MongoDB _id to string 'id' and '_id' for frontend compatibility
 */

export const serializeDoc = (doc) => {
  if (!doc) return null;

  // Handle arrays efficiently
  if (Array.isArray(doc)) {
    return doc.map(item => serializeDoc(item));
  }

  // Convert Mongoose document to plain object if it isn't already
  let obj = doc;
  if (typeof doc.toObject === 'function') {
    obj = doc.toObject({ 
      getters: true, 
      virtuals: true, 
      versionKey: false,
      transform: (doc, ret) => {
        if (ret._id) {
          ret.id = ret._id.toString();
          ret._id = ret._id.toString();
        }
        return ret;
      }
    });
    return obj;
  } 
  
  if (typeof doc.toJSON === 'function') {
    obj = doc.toJSON();
  }

  // If it's already a plain object or from toJSON, transform IDs
  return transformIds(obj);
};

/**
 * Recursively transform _id to string id and _id
 * Optimized to avoid unnecessary cloning
 */
function transformIds(obj) {
  if (!obj || typeof obj !== 'object' || obj instanceof Date) return obj;

  if (Array.isArray(obj)) {
    return obj.map(transformIds);
  }

  const newObj = { ...obj };

  if (newObj._id) {
    newObj.id = newObj._id.toString();
    newObj._id = newObj._id.toString();
  }

  // Handle nested objects
  for (const key in newObj) {
    if (newObj[key] && typeof newObj[key] === 'object' && !(newObj[key] instanceof Date)) {
      newObj[key] = transformIds(newObj[key]);
    }
  }

  return newObj;
}

export const serializeDocs = (docs) => serializeDoc(docs);