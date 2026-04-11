require('dotenv').config();
const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const sampleVideos = [
  {
    title: 'China-Bangladesh Trade Guide 2024',
    youtube_url: 'https://www.youtube.com/watch?v=example1',
    description: 'A comprehensive guide to trade between China and Bangladesh in 2024. Learn about import-export procedures, shipping methods, and business opportunities.'
  },
  {
    title: 'How to Source Products from China',
    youtube_url: 'https://www.youtube.com/watch?v=example2',
    description: 'Step-by-step guide on how to find reliable suppliers in China and source products for your business.'
  },
  {
    title: 'Sea Freight vs Air Freight',
    youtube_url: 'https://www.youtube.com/watch?v=example3',
    description: 'Comparison of sea freight and air freight options for shipping from China to Bangladesh.'
  },
  {
    title: 'Customs Clearance Process',
    youtube_url: 'https://www.youtube.com/watch?v=example4',
    description: 'Understanding the customs clearance process for imports in Bangladesh.'
  }
];

const addSampleVideos = async () => {
  try {
    await db.initDatabase();
    
    for (const video of sampleVideos) {
      const existingVideo = await db.getOne(
        'SELECT id FROM videos WHERE youtube_url = ?',
        [video.youtube_url]
      );
      
      if (!existingVideo) {
        await db.run(
          'INSERT INTO videos (id, title, youtube_url, description, status) VALUES (?, ?, ?, ?, ?)',
          [uuidv4(), video.title, video.youtube_url, video.description, 'active']
        );
        console.log(`Added video: ${video.title}`);
      } else {
        console.log(`Video already exists: ${video.title}`);
      }
    }
    
    console.log('Sample videos added successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error adding sample videos:', error);
    process.exit(1);
  }
};

addSampleVideos();
