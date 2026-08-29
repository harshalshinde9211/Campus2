require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const mongoose = require('mongoose');

const UPDATES = [
  {
    title: 'Algorithm Design Chapter Notes — All Units',
    url: 'https://nptel.ac.in/courses/106/106/106106131/',
  },
  {
    title: 'DSA Important Questions — Exam Edition',
    url: 'https://www.geeksforgeeks.org/data-structures/',
  },
  {
    title: 'Cloud Computing Previous Year Questions 2019–2023',
    url: 'https://nptel.ac.in/courses/106/105/106105167/',
  },
  {
    title: 'Operating Systems Study Material',
    url: 'https://www.os-book.com/OS10/',
  },
  {
    title: 'Database Management PYQ 2018–2023',
    url: 'https://www.geeksforgeeks.org/dbms/',
  },
  {
    title: 'Machine Learning Important Questions',
    url: 'https://www.coursera.org/learn/machine-learning',
  },
];

mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 15000 })
  .then(async () => {
    console.log('Connected to MongoDB');
    const col = mongoose.connection.db.collection('resources');

    for (const u of UPDATES) {
      const result = await col.updateOne(
        { title: u.title },
        { $set: { external_url: u.url } }
      );
      const status = result.modifiedCount === 1 ? '✅ UPDATED' : '⚠  NOT FOUND';
      console.log(status, '|', u.title.substring(0, 45));
    }

    // Verify
    console.log('\n--- Final URLs ---');
    const all = await col.find({}).toArray();
    all.forEach(r => console.log(' •', r.title.substring(0, 40).padEnd(42), r.external_url));

    await mongoose.disconnect();
    console.log('\nDone.');
  })
  .catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });
