const fs = require('fs');
const path = require('path');

const categories = ["Crypto", "Forensics", "Linux", "Misc", "Networking", "Web"];
const levels = ["Easy", "Medium", "Hard"];
const targetCount = 5000;

function generateChallenges() {
    const challenges = [];
    const countPerCategory = Math.ceil(targetCount / categories.length);

    categories.forEach(cat => {
        for (let i = 1; i <= countPerCategory; i++) {
            const isQuiz = Math.random() > 0.4; // 60% quiz, 40% ctf
            const type = isQuiz ? "quiz" : "ctf";
            const diff = levels[Math.floor(Math.random() * levels.length)];
            const id = 1000 + i;
            const title = `${cat.substring(0, 3)}-${type === 'quiz' ? 'Q' : 'C'}-${id}`;

            const challenge = {
                title: title,
                description: generateDescription(cat, type, id),
                points: getPoints(diff),
                category: cat,
                difficulty: diff,
                type: type,
                flag: generateFlag(cat, type, id)
            };

            if (isQuiz) {
                challenge.options = generateOptions(cat, challenge.flag);
            }

            challenges.push(challenge);
        }
    });

    return challenges.slice(0, targetCount);
}

function generateDescription(cat, type, id) {
    if (type === 'quiz') {
        const questions = {
            "Crypto": ["What is the primary characteristic of Caesar cipher?", "Which algorithm is used for RSA?", "What does AES stand for?", "What is a hash collision?"],
            "Forensics": ["What is the purpose of a write blocker?", "Which file signature identifies a JPEG?", "What is steganography?", "What does EXIF data contain?"],
            "Linux": ["Which command lists hidden files?", "What is the PID of the init process?", "How do you check disk usage?", "What does 'chmod 755' do?"],
            "Misc": ["What is the base of hexadecimal?", "Which tool is commonly used for network mapping?", "What is the standard port for SSH?", "What does OSI stand for?"],
            "Networking": ["What is the default port for HTTPS?", "Which layer of OSI handles IP addresses?", "What does DNS do?", "What is a subnet mask?"],
            "Web": ["What does XSS stand for?", "Which HTTP method is used for updating data?", "What is a cookie?", "What is the purpose of robots.txt?"]
        };
        const catQ = questions[cat] || ["General security question?"];
        return `${catQ[id % catQ.length]} (ID: ${id})`;
    } else {
        return `Analyze the provided resource and find the hidden flag. This is a ${cat} challenge focusing on advanced techniques. (ID: ${id})`;
    }
}

function generateFlag(cat, type, id) {
    if (type === 'quiz') {
        // Flags for quizzes are simple answers
        const answers = ["True", "False", "22", "80", "443", "AES", "BASH", "ROOT"];
        return answers[id % answers.length];
    }
    return `flag{${cat.toLowerCase()}_gen_${id}_${Math.random().toString(36).substring(7)}}`;
}

function getPoints(diff) {
    switch (diff) {
        case "Easy": return 10 + Math.floor(Math.random() * 10);
        case "Medium": return 25 + Math.floor(Math.random() * 15);
        case "Hard": return 50 + Math.floor(Math.random() * 50);
        default: return 20;
    }
}

function generateOptions(cat, flag) {
    const defaultOptions = ["Option A", "Option B", "Option C", "Option D"];
    const idx = Math.floor(Math.random() * 4);
    const options = [...defaultOptions];
    options[idx] = flag;
    return options;
}

const challenges = generateChallenges();
const content = `export const generatedChallenges = ${JSON.stringify(challenges, null, 4)};`;

fs.writeFileSync(path.join(__dirname, '../lib/generated-challenges.ts'), content);
console.log(`Successfully generated ${challenges.length} challenges in lib/generated-challenges.ts`);
