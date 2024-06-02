const { MongoClient } = require('mongodb');
require('dotenv').config();

const USERS_COL = 'users';
const MONGO_DATABASE = 'page-pal';
const MONGODB_URI =
  'mongodb+srv://nyangbin:CBphCjEqJgE6KZEu@cluster0.kjk7kxo.mongodb.net/?retryWrites=true&w=majority';

async function main() {
  console.log('migrating Ids...');
  const client = new MongoClient(MONGODB_URI);

  try {
    // Connect to the MongoDB cluster
    const database = client.db(MONGO_DATABASE);

    const users = await database.collection(USERS_COL).find().toArray();
    console.log('🚀 ~ main ~ users.length:', users.length);

    for (const user of users) {
      console.log(`🚀 processing user ${user?.firstName} ${user?.lastName}...`);
      const { _id: userMongoId, id: userUUID } = user;

      // update bookmarks
      const bookmarks = await database
        .collection('bookmarks')
        .find({ $or: [{ userId: userUUID }, { userId: userMongoId }] })
        .toArray();

      for (const bookmark of bookmarks) {
        const { _id: bkmarkMongoId, id: bkmarkUUID } = bookmark;
        console.log('🚀 ~ updating bookmark id:', bkmarkMongoId);

        let baseUpdateQuery = { userId: userMongoId };

        // get tag mongo Ids
        let bkmarkTagMongoIds = [];
        if (bookmark?.tags?.length > 0) {
          for (const tagUUID of bookmark.tags) {
            const tag = await database.collection('tags').findOne({
              $or: [
                { id: tagUUID, userId: userUUID }, // old
                { id: tagUUID, userId: userMongoId }, // new (idempotent)
              ],
            });

            if (tag) {
              bkmarkTagMongoIds.push(tag._id);
            }
          }
        }
        if (bkmarkTagMongoIds.length > 0) {
          console.log('🚀 ~ main ~ bkmarkTagMongoIds:', bkmarkTagMongoIds);
          baseUpdateQuery['tags'] = bkmarkTagMongoIds;
        }

        // update userId in bookmark
        const updateRes = await database
          .collection('bookmarks')
          .updateOne({ _id: bkmarkMongoId }, { $set: baseUpdateQuery });
      }
    }

    // update all tags
    const tags = await database.collection('tags').find({}).toArray();

    for (const tag of tags) {
      console.log('🚀 updating tag:', tag._id);
      const { _id: tagMongoId, id: tagUUID, userId: userUUID, name } = tag;

      // find userid
      const user = await database.collection('users').findOne({ id: userUUID });

      // update bookmark
      if (user) {
        const updateRes = await database
          .collection('tags')
          .updateOne({ _id: tagMongoId }, { $set: { userId: user._id } });
      }
    }

    console.log('🚀 migration ended');
  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
}

main();
