const fs = require('fs');
const path = require('path');

const categories = ["Crypto", "Forensics", "Linux", "Misc", "Networking", "Web"];
const levels = ["Easy", "Medium", "Hard"];
const targetCount = 5000;

// Extensive template library for better variety
const templates = {
    "Web": {
        "questions": [
            { q: "Which HTTP header is used to prevent Clickjacking?", a: "X-Frame-Options", alt: ["X-XSS-Protection", "Content-Type", "Server"] },
            { q: "What does the 'SameSite' attribute in cookies help prevent?", a: "CSRF", alt: ["XSS", "SQLi", "LFI"] },
            { q: "Which vulnerability allows an attacker to include local files on the server?", a: "LFI", alt: ["RFI", "RCE", "XSS"] },
            { q: "What is the primary target of a Blind SQL Injection?", a: "Database Schema/Data", alt: ["JavaScript Execution", "File System", "Network Port"] },
            { q: "What is the meaning of a 403 Forbidden status code?", a: "Access Denied", alt: ["Not Found", "Server Error", "Redirect"] },
            { q: "Which tool is commonly used for intercepting Web traffic?", a: "Burp Suite", alt: ["Metasploit", "Nmap", "Wireshark"] },
            { q: "What is 'Polyglot' in the context of XSS?", a: "Payload working in multiple contexts", alt: ["Multi-language website", "Encrypted script", "Server-side XSS"] },
            { q: "What does JWT stand for?", a: "JSON Web Token", alt: ["Java Web Tool", "Joint Web Technology", "Just Web Template"] }
        ]
    },
    "Crypto": {
        "questions": [
            { q: "Which cipher uses a 5x5 grid of letters?", a: "Playfair", alt: ["Caesar", "Vigenere", "Enigma"] },
            { q: "What is the block size of AES?", a: "128 bits", alt: ["64 bits", "256 bits", "512 bits"] },
            { q: "Which hash function is currently considered 'broken' for security?", a: "MD5", alt: ["SHA-256", "SHA-3", "BLAKE2"] },
            { q: "In RSA, what does the 'e' stand for?", a: "Public Exponent", alt: ["Encryption key", "Entropy", "Euler's number"] },
            { q: "What is 'Salt' in password hashing?", a: "Random data added to input", alt: ["A type of encryption", "A hardware module", "A database index"] },
            { q: "Which algorithm is used for Diffie-Hellman?", a: "Key Exchange", alt: ["Digital Signature", "Hard Drive Encryption", "File Compression"] }
        ]
    },
    "Linux": {
        "questions": [
            { q: "Which command is used to change file permissions?", a: "chmod", alt: ["chown", "ls", "pwd"] },
            { q: "What is the default location for system logs?", a: "/var/log", alt: ["/etc/logs", "/usr/logs", "/home/logs"] },
            { q: "Which signal is sent by 'kill -9'?", a: "SIGKILL", alt: ["SIGTERM", "SIGINT", "SIGSTOP"] },
            { q: "What does the 'S' stand for in SUID?", a: "Set", alt: ["Secure", "System", "Static"] },
            { q: "How do you view the last 10 lines of a file?", a: "tail", alt: ["head", "cat", "grep"] },
            { q: "Which directory contains configuration files?", a: "/etc", alt: ["/bin", "/lib", "/opt"] }
        ]
    },
    "Networking": {
        "questions": [
            { q: "What is the standard port for SSH?", a: "22", alt: ["21", "23", "25"] },
            { q: "Which protocol is used for resolving IP to MAC addresses?", a: "ARP", alt: ["DNS", "DHCP", "ICMP"] },
            { q: "What is the maximum value of a port number?", a: "65535", alt: ["1024", "32768", "8192"] },
            { q: "Which OSI layer does a Router operate at?", a: "Layer 3", alt: ["Layer 2", "Layer 4", "Layer 7"] },
            { q: "What does TTL stand for in a ping request?", a: "Time To Live", alt: ["Total Time Lost", "Target To Locate", "Temporary Trace Link"] }
        ]
    },
    "Forensics": {
        "questions": [
            { q: "What is a 'Magic Number' in a file?", a: "Hex signature at the start", alt: ["A random ID", "The file size", "A checksum"] },
            { q: "Which tool is used for memory forensics?", a: "Volatility", alt: ["Autopsy", "Wireshark", "FTK Imager"] },
            { q: "What is 'Carving' in forensics?", a: "Recovering files without metadata", alt: ["Deleting evidence", "Encrypting a drive", "Sorting logs"] }
        ]
    },
    "Misc": {
        "questions": [
            { q: "What is Social Engineering?", a: "Manipulating people for info", alt: ["Coding a social network", "Fixing hardware", "Marketing"] },
            { q: "What is a 'Honey Pot'?", a: "Deceptive system to trap hackers", alt: ["A shared password", "A backup server", "A fast network"] }
        ]
    }
};

function generateChallenges() {
    const challenges = [];
    const countPerCategory = Math.ceil(targetCount / categories.length);

    categories.forEach(cat => {
        const catData = templates[cat] || templates["Misc"];
        for (let i = 1; i <= countPerCategory; i++) {
            const isQuiz = true; // Force quiz only
            const type = "quiz";
            const diff = levels[Math.floor(Math.random() * levels.length)];
            const id = 2000 + i; // Start from 2000 to avoid overlap with previous IDs
            const title = `${cat.substring(0, 3)}-Q-${id}`;

            let description, points, flag, options;

            const qTemplate = catData.questions[i % catData.questions.length];
            description = `${qTemplate.q} (Ref: ${id})`;
            flag = qTemplate.a;
            options = shuffle([...qTemplate.alt, flag]);
            points = getPoints(diff) / 2; // Quizzes are worth less

            challenges.push({
                title,
                description,
                points: Math.floor(points),
                category: cat,
                difficulty: diff,
                type,
                flag,
                options
            });
        }
    });

    return challenges.slice(0, targetCount);
}

function getPoints(diff) {
    switch (diff) {
        case "Easy": return 20 + Math.random() * 20;
        case "Medium": return 50 + Math.random() * 30;
        case "Hard": return 100 + Math.random() * 100;
        default: return 50;
    }
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

const challenges = generateChallenges();
const content = `/** 
 * Generated Challenges Pool (Improved Quality)
 * These challenges are programmatically generated based on technical templates.
 */
export const generatedChallenges = ${JSON.stringify(challenges, null, 4)};`;

fs.writeFileSync(path.join(__dirname, '../lib/generated-challenges.ts'), content);
console.log(`Successfully generated ${challenges.length} high-quality challenges in lib/generated-challenges.ts`);
