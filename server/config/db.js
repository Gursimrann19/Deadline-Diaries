const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const dbFile = path.join(__dirname, '../data/db.json');

// Initialize with empty arrays if not exists
if (!fs.existsSync(dbFile)) {
  fs.mkdirSync(path.dirname(dbFile), { recursive: true });
  fs.writeFileSync(dbFile, JSON.stringify({
    users: [], tasks: [], assignments: [], projects: [], attendance: []
  }, null, 2));
}

const readDb = () => JSON.parse(fs.readFileSync(dbFile, 'utf8'));
const writeDb = (data) => fs.writeFileSync(dbFile, JSON.stringify(data, null, 2));

class Collection {
  constructor(name) { this.name = name; }

  async findAsync(query = {}) {
    const data = readDb()[this.name] || [];
    return data.filter(item => {
      for (let key in query) {
        if (key === '$or') {
            if (!query.$or.some(q => Object.keys(q).every(k => item[k] === q[k]))) return false;
        } else if (typeof query[key] === 'object' && query[key].$in) {
            if (!query[key].$in.includes(item[key])) return false;
        } else if (item[key] !== query[key]) {
            return false;
        }
      }
      return true;
    });
  }

  async findOneAsync(query = {}) {
    const results = await this.findAsync(query);
    return results[0] || null;
  }

  async insertAsync(doc) {
    const db = readDb();
    if (!db[this.name]) db[this.name] = [];
    const newDoc = { _id: crypto.randomBytes(8).toString('hex'), ...doc };
    
    // basic uniqueness check for email
    if (this.name === 'users' && doc.email) {
       if (db.users.find(u => u.email === doc.email)) {
           const err = new Error('Unique constraint violated');
           err.errorType = 'uniqueViolated';
           throw err;
       }
    }
    
    db[this.name].push(newDoc);
    writeDb(db);
    return newDoc;
  }

  async updateAsync(query, update, options = {}) {
    const db = readDb();
    if (!db[this.name]) db[this.name] = [];
    let updated = false;
    for (let i = 0; i < db[this.name].length; i++) {
      let item = db[this.name][i];
      let match = true;
      for (let key in query) {
        if (item[key] !== query[key]) match = false;
      }
      if (match) {
        if (update.$set) {
          db[this.name][i] = { ...item, ...update.$set };
        } else {
          db[this.name][i] = { ...item, ...update, _id: item._id }; // preserve _id
        }
        updated = true;
        if (!options.multi) break;
      }
    }
    writeDb(db);
    return updated;
  }

  async removeAsync(query, options = {}) {
    const db = readDb();
    if (!db[this.name]) db[this.name] = [];
    
    let removed = false;
    db[this.name] = db[this.name].filter(item => {
      let match = true;
      for (let key in query) {
        if (item[key] !== query[key]) match = false;
      }
      if (match && !options.multi && removed) {
          return true; // keep others if not multi
      }
      if (match) removed = true;
      return !match; 
    });
    writeDb(db);
  }
}

console.log('✅ Local JSON database ready → server/data/db.json');
module.exports = {
  users: new Collection('users'),
  tasks: new Collection('tasks'),
  assignments: new Collection('assignments'),
  projects: new Collection('projects'),
  attendance: new Collection('attendance'),
};
