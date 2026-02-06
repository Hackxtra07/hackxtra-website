const mongoose = require('mongoose');

async function seedData() {
  try {
    await mongoose.connect('mongodb://localhost:27017/hackxtras');
    console.log('Connected to MongoDB');

    // Define schemas
    const courseSchema = new mongoose.Schema({
      title: String,
      description: String,
      category: String,
      level: String,
      youtubeLink: String,
      duration: String,
      instructor: String,
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now }
    });

    const labSchema = new mongoose.Schema({
      title: String,
      description: String,
      difficulty: String,
      category: String,
      objectives: [String],
      tools: [String],
      timeToComplete: Number,
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now }
    });

    const resourceSchema = new mongoose.Schema({
      title: String,
      description: String,
      type: String,
      url: String,
      category: String,
      tags: [String],
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now }
    });

    const channelSchema = new mongoose.Schema({
      name: String,
      description: String,
      icon: String,
      link: String,
      category: String,
      followers: Number,
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now }
    });

    const Course = mongoose.model('Course', courseSchema);
    const Lab = mongoose.model('Lab', labSchema);
    const Resource = mongoose.model('Resource', resourceSchema);
    const Channel = mongoose.model('Channel', channelSchema);

    // Clear existing data
    await Course.deleteMany({});
    await Lab.deleteMany({});
    await Resource.deleteMany({});
    await Channel.deleteMany({});
    console.log('Cleared existing data');

    // Add sample courses
    const courses = await Course.insertMany([
      {
        title: 'Web Security 101',
        description: 'Learn the fundamentals of web security including SQL injection, XSS, and CSRF attacks.',
        category: 'Web Security',
        level: 'Beginner',
        youtubeLink: 'https://www.youtube.com/watch?v=jsDe_MjEhm4',
        duration: '2 hours',
        instructor: 'Security Expert'
      },
      {
        title: 'Network Security Fundamentals',
        description: 'Master network security concepts, protocols, and defensive strategies.',
        category: 'Network Security',
        level: 'Intermediate',
        youtubeLink: 'https://www.youtube.com/watch?v=JT9vUjr1gUA',
        duration: '3 hours',
        instructor: 'Network Expert'
      },
      {
        title: 'Advanced Penetration Testing',
        description: 'Deep dive into advanced penetration testing techniques and methodologies.',
        category: 'Penetration Testing',
        level: 'Advanced',
        youtubeLink: 'https://www.youtube.com/watch?v=qAhx-97BTv4',
        duration: '4 hours',
        instructor: 'Pentesting Pro'
      },
      {
        title: 'Cryptography Essentials',
        description: 'Understanding encryption, hashing, and cryptographic algorithms.',
        category: 'Cryptography',
        level: 'Intermediate',
        youtubeLink: 'https://www.youtube.com/watch?v=TmA2QYmxjms',
        duration: '2.5 hours',
        instructor: 'Crypto Expert'
      },
      {
        title: 'Secure Coding Practices',
        description: 'Write secure code and avoid common vulnerabilities in your applications.',
        category: 'Secure Coding',
        level: 'Beginner',
        youtubeLink: 'https://www.youtube.com/watch?v=O-NM-4ibHFo',
        duration: '2 hours',
        instructor: 'Code Security Expert'
      },
      {
        title: 'Cloud Security Architecture',
        description: 'Secure your cloud infrastructure and data in AWS, Azure, and GCP.',
        category: 'Cloud Security',
        level: 'Advanced',
        youtubeLink: 'https://www.youtube.com/watch?v=wWaAa5zfpKA',
        duration: '3 hours',
        instructor: 'Cloud Security Specialist'
      }
    ]);
    console.log('✅ Added 6 sample courses');

    // Add sample labs
    const labs = await Lab.insertMany([
      {
        title: 'SQL Injection Lab',
        description: 'Hands-on practice with SQL injection vulnerabilities.',
        difficulty: 'Easy',
        category: 'Web Security',
        objectives: ['Understand SQL injection', 'Exploit vulnerable databases', 'Practice defense mechanisms'],
        tools: ['DVWA', 'MySQL', 'Burp Suite'],
        timeToComplete: 60
      },
      {
        title: 'Network Packet Analysis',
        description: 'Learn to analyze network traffic and identify anomalies.',
        difficulty: 'Medium',
        category: 'Network Security',
        objectives: ['Capture network packets', 'Analyze protocols', 'Identify malicious traffic'],
        tools: ['Wireshark', 'Nmap', 'tcpdump'],
        timeToComplete: 90
      },
      {
        title: 'Cryptography Implementation',
        description: 'Implement and break cryptographic algorithms.',
        difficulty: 'Hard',
        category: 'Cryptography',
        objectives: ['Implement AES encryption', 'Break Caesar cipher', 'Analyze hash functions'],
        tools: ['Python', 'OpenSSL', 'Hashcat'],
        timeToComplete: 120
      },
      {
        title: 'Web Application Scanning',
        description: 'Use automated tools to scan web applications for vulnerabilities.',
        difficulty: 'Easy',
        category: 'Web Security',
        objectives: ['Configure web scanners', 'Identify vulnerabilities', 'Generate reports'],
        tools: ['Burp Suite Community', 'OWASP ZAP'],
        timeToComplete: 45
      },
      {
        title: 'Malware Analysis',
        description: 'Analyze and reverse engineer malware samples.',
        difficulty: 'Hard',
        category: 'Malware Analysis',
        objectives: ['Reverse engineer malware', 'Extract indicators', 'Behavioral analysis'],
        tools: ['IDA Pro', 'Ghidra', 'Cuckoo Sandbox'],
        timeToComplete: 150
      },
      {
        title: 'Linux System Hardening',
        description: 'Secure a Linux system against common attacks.',
        difficulty: 'Medium',
        category: 'System Security',
        objectives: ['Configure firewall', 'User management', 'System auditing'],
        tools: ['Linux CLI', 'Fail2ban', 'AppArmor'],
        timeToComplete: 75
      }
    ]);
    console.log('✅ Added 6 sample labs');

    // Add sample resources
    const resources = await Resource.insertMany([
      {
        title: 'OWASP Top 10',
        description: 'Guide to the top 10 web application security risks.',
        type: 'PDF',
        url: 'https://owasp.org/www-project-top-ten/',
        category: 'Web Security',
        tags: ['security', 'web', 'vulnerabilities']
      },
      {
        title: 'HackTheBox',
        description: 'Online platform to practice penetration testing skills.',
        type: 'Link',
        url: 'https://www.hackthebox.com/',
        category: 'Penetration Testing',
        tags: ['ctf', 'practice', 'hacking']
      },
      {
        title: 'Cybersecurity Fundamentals Course',
        description: 'Comprehensive video course on cybersecurity basics.',
        type: 'Video',
        url: 'https://www.youtube.com/playlist?list=PLBf0hzazHTvM',
        category: 'Fundamentals',
        tags: ['video', 'course', 'beginner']
      },
      {
        title: 'Network Security Handbook',
        description: 'Reference guide for network security best practices.',
        type: 'Document',
        url: 'https://docs.example.com/network-security',
        category: 'Network Security',
        tags: ['handbook', 'reference', 'network']
      },
      {
        title: 'TryHackMe',
        description: 'Interactive cybersecurity training platform.',
        type: 'Link',
        url: 'https://tryhackme.com/',
        category: 'Training',
        tags: ['interactive', 'learning', 'labs']
      },
      {
        title: 'Reverse Engineering Guide',
        description: 'Step-by-step guide to reverse engineering techniques.',
        type: 'PDF',
        url: 'https://example.com/reverse-engineering-guide.pdf',
        category: 'Reverse Engineering',
        tags: ['reversing', 'assembly', 'guide']
      }
    ]);
    console.log('✅ Added 6 sample resources');

    // Add sample channels
    const channels = await Channel.insertMany([
      {
        name: 'HackerSploit',
        description: 'Learn ethical hacking and penetration testing tutorials.',
        icon: '📺',
        link: 'https://www.youtube.com/c/HackerSploit',
        category: 'YouTube',
        followers: 150000
      },
      {
        name: 'NetworkChuck',
        description: 'Cybersecurity and networking content for everyone.',
        icon: '📺',
        link: 'https://www.youtube.com/c/NetworkChuck',
        category: 'YouTube',
        followers: 300000
      },
      {
        name: 'Cybersecurity Hub',
        description: 'Discord community for cybersecurity professionals.',
        icon: '💬',
        link: 'https://discord.gg/cybersecurity',
        category: 'Discord',
        followers: 5000
      },
      {
        name: 'Security Newsletter',
        description: 'Weekly security news and updates.',
        icon: '📧',
        link: 'https://newsletter.example.com',
        category: 'Newsletter',
        followers: 50000
      },
      {
        name: 'Cybersecurity Twitter',
        description: 'Latest security news on Twitter/X.',
        icon: '🐦',
        link: 'https://twitter.com/cybersecurity',
        category: 'Twitter',
        followers: 200000
      },
      {
        name: 'Security Podcast',
        description: 'Daily security news and interviews.',
        icon: '🎙️',
        link: 'https://podcast.example.com',
        category: 'Podcast',
        followers: 75000
      }
    ]);
    console.log('✅ Added 6 sample channels');

    console.log('\n✅ All sample data created successfully!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

seedData();
