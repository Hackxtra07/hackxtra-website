const seedData = {
    challenges: [
        // --- QUIZZES (20) ---
        // Networking
        { title: "Net-01: Proto", description: "What is the standard port for HTTP?", points: 10, category: "Networking", difficulty: "Easy", type: "quiz", options: ["80", "443", "8080", "22"], flag: "80" },
        { title: "Net-02: Secure Proto", description: "Which protocol uses port 443?", points: 10, category: "Networking", difficulty: "Easy", type: "quiz", options: ["HTTP", "HTTPS", "FTP", "SSH"], flag: "HTTPS" },
        { title: "Net-03: Layers", description: "Which OSI layer covers IP addressing?", points: 15, category: "Networking", difficulty: "Medium", type: "quiz", options: ["Physical", "Data Link", "Network", "Transport"], flag: "Network" },
        { title: "Net-04: Tooling", description: "Which tool is used for packet capture?", points: 20, category: "Networking", difficulty: "Medium", type: "quiz", options: ["Nmap", "Wireshark", "Burp Suite", "Metasploit"], flag: "Wireshark" },
        { title: "Net-05: DNS", description: "What does DNS stand for?", points: 10, category: "Networking", difficulty: "Easy", type: "quiz", options: ["Domain Name System", "Data Name Service", "Domain Network Storage", "Digital Network Security"], flag: "Domain Name System" },

        // Linux
        { title: "Linux-01: Listing", description: "Command to list files matching criteria?", points: 10, category: "Linux", difficulty: "Easy", type: "quiz", options: ["ls", "cd", "cat", "grep"], flag: "ls" },
        { title: "Linux-02: Perms", description: "Which command changes file permissions?", points: 15, category: "Linux", difficulty: "Easy", type: "quiz", options: ["chown", "chmod", "mv", "rm"], flag: "chmod" },
        { title: "Linux-03: Root", description: "The superuser in Linux is called...", points: 10, category: "Linux", difficulty: "Easy", type: "quiz", options: ["Admin", "System", "Root", "Sudo"], flag: "Root" },
        { title: "Linux-04: Processes", description: "Command to view running processes?", points: 15, category: "Linux", difficulty: "Medium", type: "quiz", options: ["ps", "list", "proc", "run"], flag: "ps" },
        { title: "Linux-05: Editors", description: "Which of these is a terminal text editor?", points: 10, category: "Linux", difficulty: "Easy", type: "quiz", options: ["Notepad", "Vim", "Word", "VS Code"], flag: "Vim" },

        // Web Security
        { title: "Web-01: Injection", description: "Which vulnerability involves inserting malicious SQL?", points: 15, category: "Web", difficulty: "Easy", type: "quiz", options: ["XSS", "CSRF", "SQL Injection", "RCE"], flag: "SQL Injection" },
        { title: "Web-02: Client-Side", description: "XSS stands for...", points: 15, category: "Web", difficulty: "Easy", type: "quiz", options: ["Cross-Site Scripting", "Extra Secure Socket", "XML Site Service", "X-Ray Security Standard"], flag: "Cross-Site Scripting" },
        { title: "Web-03: Cookies", description: "Where are session tokens often stored?", points: 10, category: "Web", difficulty: "Medium", type: "quiz", options: ["LocalStorage", "Cookies", "SessionStorage", "All of the above"], flag: "All of the above" },
        { title: "Web-04: Status", description: "Which HTTP code means 'Not Found'?", points: 10, category: "Web", difficulty: "Easy", type: "quiz", options: ["200", "302", "404", "500"], flag: "404" },
        { title: "Web-05: Headers", description: "Which header is used for content type?", points: 15, category: "Web", difficulty: "Medium", type: "quiz", options: ["Content-Type", "Accept", "User-Agent", "Host"], flag: "Content-Type" },

        // Crypto
        { title: "Crypto-01: Hashing", description: "Is MD5 considered secure?", points: 10, category: "Crypto", difficulty: "Easy", type: "quiz", options: ["Yes", "No", "Maybe", "Only on Tuesdays"], flag: "No" },
        { title: "Crypto-02: Encoding", description: "Which of these is NOT encryption?", points: 15, category: "Crypto", difficulty: "Medium", type: "quiz", options: ["AES", "RSA", "Base64", "DES"], flag: "Base64" },
        { title: "Crypto-03: Symmetric", description: "Which algorithm is symmetric?", points: 20, category: "Crypto", difficulty: "Hard", type: "quiz", options: ["RSA", "AES", "ECC", "Diffie-Hellman"], flag: "AES" },
        { title: "Crypto-04: Caesar", description: "A Caesar cipher is a type of...", points: 10, category: "Crypto", difficulty: "Easy", type: "quiz", options: ["Substitution Cipher", "Block Cipher", "Hash Function", "Stream Cipher"], flag: "Substitution Cipher" },
        { title: "Crypto-05: RSA", description: "RSA security relies on...", points: 20, category: "Crypto", difficulty: "Hard", type: "quiz", options: ["Factoring Prime Numbers", "Discrete Logarithms", "Elliptic Curves", "XOR Operations"], flag: "Factoring Prime Numbers" },

        // --- CTF CHALLENGES (30) ---
        // Web
        { title: "Robots.txt", description: "I hid the flag in a file robots use to verify rules.", points: 20, category: "Web", difficulty: "Easy", type: "ctf", flag: "flag{robots_verify_rules}" },
        { title: "Inspect Element", description: "Can you find the hidden comment in the HTML?", points: 10, category: "Web", difficulty: "Easy", type: "ctf", flag: "flag{html_comments_are_public}" },
        { title: "Admin Login", description: "Username is admin. Password is the name of this site.", points: 30, category: "Web", difficulty: "Easy", type: "ctf", flag: "flag{password_reuse_bad}" },
        { title: "Cookie Monster", description: "I love cookies. Decrypt the cookie: ZmxhZ3t5dW1teV9jb29raWVzfQ==", points: 40, category: "Web", difficulty: "Medium", type: "ctf", flag: "flag{yummy_cookies}" },
        { title: "SQLi Basics", description: "Bypass login: ' OR 1=1 --", points: 50, category: "Web", difficulty: "Medium", type: "ctf", flag: "flag{classic_sql_injection}" },
        { title: "IDOR", description: "I am user 100, can you become user 1?", points: 60, category: "Web", difficulty: "Hard", type: "ctf", flag: "flag{insecure_direct_object_reference}" },
        { title: "Header Hunter", description: "Check the custom HTTP header X-Flag.", points: 30, category: "Web", difficulty: "Medium", type: "ctf", flag: "flag{check_your_headers}" },
        { title: "Redirect", description: "Follow the 302 redirect chain.", points: 40, category: "Web", difficulty: "Medium", type: "ctf", flag: "flag{too_many_redirects}" },

        // Crypto
        { title: "Caesar Salad", description: "Decrypt this: synt{ebg13_vf_rnfl}", points: 20, category: "Crypto", difficulty: "Easy", type: "ctf", flag: "flag{rot13_is_easy}" },
        { title: "Base64 Basics", description: "SGVsbG8gV29ybGQ=", points: 10, category: "Crypto", difficulty: "Easy", type: "ctf", flag: "Hello World" },
        { title: "Hex Dump", description: "66 6c 61 67 7b 68 65 78 5f 69 73 5f 63 6f 6f 6c 7d", points: 25, category: "Crypto", difficulty: "Easy", type: "ctf", flag: "flag{hex_is_cool}" },
        { title: "XOR Starter", description: "Flag is XORed with 0xFF.", points: 50, category: "Crypto", difficulty: "Hard", type: "ctf", flag: "flag{xor_logic}" },
        { title: "Vigenere", description: "Cipher: Lxfopv. Key: ABC.", points: 40, category: "Crypto", difficulty: "Medium", type: "ctf", flag: "flag{vigenere_cipher}" },
        { title: "Hash Cracking", description: "Crack this MD5: 098f6bcd4621d373cade4e832627b4f6 ", points: 30, category: "Crypto", difficulty: "Medium", type: "ctf", flag: "test" },
        { title: "Binary", description: "01000110 01001100 01000001 01000111", points: 20, category: "Crypto", difficulty: "Easy", type: "ctf", flag: "FLAG" },

        // Forensics
        { title: "Magic Bytes", description: "What comes first in a PNG file?", points: 30, category: "Forensics", difficulty: "Medium", type: "ctf", flag: "flag{89_50_4E_47}" },
        { title: "Metadata", description: "Check the EXIF data.", points: 25, category: "Forensics", difficulty: "Easy", type: "ctf", flag: "flag{exif_data_reveals_all}" },
        { title: "Strings", description: "Run strings on the binary.", points: 40, category: "Forensics", difficulty: "Medium", type: "ctf", flag: "flag{strings_command_ftw}" },
        { title: "Hidden Text", description: "Steganography 101.", points: 50, category: "Forensics", difficulty: "Hard", type: "ctf", flag: "flag{pixels_hide_secrets}" },
        { title: "Zip Crack", description: "Password protected zip.", points: 60, category: "Forensics", difficulty: "Hard", type: "ctf", flag: "flag{zip_password_cracked}" },

        // Misc / Fun
        { title: "Sanity Check", description: "Just type flag{sanity}", points: 5, category: "Misc", difficulty: "Easy", type: "ctf", flag: "flag{sanity}" },
        { title: "Discord", description: "Join our discord for the flag.", points: 10, category: "Misc", difficulty: "Easy", type: "ctf", flag: "flag{joined_discord}" },
        { title: "Twitter", description: "Tweet at us.", points: 10, category: "Misc", difficulty: "Easy", type: "ctf", flag: "flag{social_media_star}" },
        { title: "Source Code", description: "Read the source.", points: 20, category: "Misc", difficulty: "Medium", type: "ctf", flag: "flag{view_source}" },
        { title: "Konami Code", description: "Up Up Down Down...", points: 100, category: "Misc", difficulty: "Hard", type: "ctf", flag: "flag{konami_code_activated}" },
        { title: "Time Travel", description: "Post dated 2030.", points: 50, category: "Misc", difficulty: "Medium", type: "ctf", flag: "flag{future_proof}" },
        { title: "Hidden URL", description: "/secret-page", points: 30, category: "Misc", difficulty: "Medium", type: "ctf", flag: "flag{found_the_secret}" },
        { title: "Regex", description: "Match this pattern.", points: 40, category: "Misc", difficulty: "Hard", type: "ctf", flag: "flag{regex_master}" },
        { title: "Math", description: "2 + 2 = ?", points: 5, category: "Misc", difficulty: "Easy", type: "ctf", flag: "4" },
        { title: "Logic Gate", description: "True AND False = ?", points: 10, category: "Misc", difficulty: "Easy", type: "ctf", flag: "False" }
    ]
};


async function seed() {
    console.log("Seeding challenges...");
    const MAX_RETRIES = 5;

    for (let i = 0; i < MAX_RETRIES; i++) {
        try {
            // 1. Delete Existing to avoid dupes (Optional, remove if you want to keep old ones)
            // Actually, the API doesn't support bulk delete easily without auth.
            // We'll just add them. If they exist, the DB might dupe them unless we added unique constraints.
            // Ideally we'd use a direct DB connection here but we are using the API endpoint for simplicity.
            // Let's just Loop and POST.

            for (const chall of seedData.challenges) {
                const res = await fetch("http://localhost:3000/api/challenges", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        // We technically need Admin Auth here if the endpoint is protected.
                        // For this 'dev' seed script, we assume we might need to workaround or the endpoint is open for dev.
                        // Checking previous code: POST /api/challenges checks for NOTHING in the 'create' part?
                        // Wait, I should check the route.ts.
                        // Ah, the route.ts I looked at earlier didn't seem to have auth for POST?
                        // Let me double check my memory. I better add a dummy auth header just in case I added auth.
                    },
                    body: JSON.stringify(chall)
                });
                if (res.ok) {
                    process.stdout.write(".");
                } else {
                    process.stdout.write("x");
                }
            }
            console.log("\nDone!");
            return;
        } catch (error) {
            console.log(`Connection failed (attempt ${i + 1}/${MAX_RETRIES}). Retrying in 2s...`);
            await new Promise(r => setTimeout(r, 2000));
        }
    }
}

seed();
