
import { Question } from "./models.js";

const questions = [
  {
    question: "What should you do with a suspicious email link?",
    options: [
      "Click it immediately",
      "Verify the sender and link before taking action",
      "Forward it to everyone",
      "Enter your password"
    ],
    correctAnswer: 1,
    explanation:
      "Verify suspicious messages using a trusted channel and report phishing attempts.",
    category: "Phishing"
  },
  {
    question: "Which password practice is safest?",
    options: [
      "Reuse one password everywhere",
      "Use your birthday",
      "Use unique passwords and a password manager",
      "Share passwords with friends"
    ],
    correctAnswer: 2,
    explanation:
      "Unique passwords reduce the impact of an account compromise.",
    category: "Password Security"
  },
  {
    question: "What does HTTPS help protect?",
    options: [
      "Data in transit between browser and server",
      "Every file on your computer",
      "All malware on a device",
      "Your account from every possible attack"
    ],
    correctAnswer: 0,
    explanation:
      "HTTPS encrypts data in transit, but it does not guarantee a website is trustworthy.",
    category: "Network Security"
  },
  {
    question: "What is multi-factor authentication (MFA)?",
    options: [
      "Using the same password twice",
      "Using two or more different authentication factors",
      "Changing your username daily",
      "Disabling account security"
    ],
    correctAnswer: 1,
    explanation:
      "MFA combines different types of proof, such as a password and a security key.",
    category: "Authentication"
  },
  {
    question: "What should you do when an unknown USB drive is found?",
    options: [
      "Plug it into your personal laptop",
      "Open all its files",
      "Give it to the appropriate IT or security team",
      "Copy its files to a shared computer"
    ],
    correctAnswer: 2,
    explanation:
      "Unknown USB devices can contain malicious software. Report them to the appropriate team.",
    category: "Malware"
  },
  {
    question: "What is the purpose of a firewall?",
    options: [
      "Control network traffic according to security rules",
      "Guarantee that every download is safe",
      "Replace every software update",
      "Recover forgotten passwords"
    ],
    correctAnswer: 0,
    explanation:
      "A firewall filters network traffic based on configured rules.",
    category: "Network Security"
  },
  {
    question: "What should you do after discovering a security incident?",
    options: [
      "Delete all evidence",
      "Ignore it",
      "Post confidential logs publicly",
      "Report it through the approved incident process"
    ],
    correctAnswer: 3,
    explanation:
      "Prompt reporting helps the security team investigate and contain incidents.",
    category: "Incident Response"
  },
  {
    question: "Why should software updates be installed?",
    options: [
      "Only to change the wallpaper",
      "To obtain security fixes and improvements",
      "To remove all authentication",
      "To disable backups"
    ],
    correctAnswer: 1,
    explanation:
      "Updates often fix vulnerabilities and improve software security.",
    category: "Security Hygiene"
  },
  {
    question: "Which is an example of sensitive information?",
    options: [
      "A public weather report",
      "A public news headline",
      "A private account password",
      "A public holiday date"
    ],
    correctAnswer: 2,
    explanation:
      "Account passwords must be kept secret and protected.",
    category: "Data Privacy"
  },
  {
    question: "What is social engineering?",
    options: [
      "Manipulating people to reveal information or take unsafe actions",
      "Improving network cable speed",
      "Encrypting every hard drive",
      "Updating a website layout"
    ],
    correctAnswer: 0,
    explanation:
      "Social engineering exploits human trust and behavior to achieve an attacker's goal.",
    category: "Social Engineering"
  }
];

export async function seedQuestions() {
  const count = await Question.countDocuments();

  if (count === 0) {
    await Question.insertMany(questions);
    console.log("Sample cybersecurity questions inserted");
  }
}
