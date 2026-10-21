import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding LIFEOS database with verified stories, users, and defaults...');

  // 1. Seed Verified Motivational Stories with Grounded Sources
  const storiesData = [
    {
      title: 'Linus Torvalds and the Genesis of Git',
      subject: 'Linus Torvalds',
      careerCategory: 'Software Engineering',
      summary: 'How Linus Torvalds engineered Git in under two weeks through disciplined, incremental problem-solving.',
      fullContent: 'In April 2005, the Linux development community lost access to their proprietary version control tool. Rather than despairing, Linus Torvalds retreated to his desk with a singularly clear problem: design a distributed revision system capable of patching a thousand commits a day. He released the first functional working version of Git on April 7, 2005, just days after writing the initial commit. Torvalds did not rely on endless brainstorming sessions; he wrote a minimal working tool and iterated hour by hour. Meaningful engineering projects do not require monumental setup—they begin with 20 minutes spent fixing one concrete component.',
      supportedLanguages: ['en', 'hi', 'hinglish'],
      verificationStatus: 'VERIFIED',
      sources: [
        {
          sourceName: 'Git Core Documentation and Linus Torvalds LKML Announcement',
          sourceUrl: 'https://lore.kernel.org/git/Pine.LNX.4.58.0504081016550.2227@ppc970.osdl.org/',
          sourceType: 'OFFICIAL_DOC',
        },
        {
          sourceName: 'Just for Fun: The Story of an Accidental Revolutionary (HarperBusiness)',
          sourceUrl: 'https://en.wikipedia.org/wiki/Just_for_Fun',
          sourceType: 'BIOGRAPHY',
        },
      ],
    },
    {
      title: 'Steve Wozniak and the Evening Workbench',
      subject: 'Steve Wozniak',
      careerCategory: 'Software Engineering',
      summary: 'Steve Wozniak engineered the Apple I schematic by dedicating 45-minute pockets after his shift at Hewlett-Packard.',
      fullContent: 'Throughout 1975, Steve Wozniak held a demanding full-time engineering position designing calculator chips at Hewlett-Packard in Cupertino. He could not afford full days for personal experiments. Instead, he reserved 45 minutes every evening at his workbench, systematically testing RAM timings and connecting a microprocessor to a television display. That disciplined evening habit became the Apple I motherboard. You do not need an entire empty weekend to master your craft. A single 25-minute focus session today preserves the momentum of your future.',
      supportedLanguages: ['en', 'hi', 'hinglish'],
      verificationStatus: 'VERIFIED',
      sources: [
        {
          sourceName: 'iWoz: Computer Geek to Cult Icon (W. W. Norton & Company, 2006)',
          sourceUrl: 'https://wwnorton.com/books/iWoz/',
          sourceType: 'BIOGRAPHY',
        },
      ],
    },
    {
      title: 'Fei-Fei Li and the Genesis of ImageNet',
      subject: 'Dr. Fei-Fei Li',
      careerCategory: 'Artificial Intelligence',
      summary: 'Dr. Fei-Fei Li realized that AI needed high-quality datasets more than complex algorithms, painstakingly labeling 14 million images.',
      fullContent: 'In 2006, the mainstream AI community focused almost exclusively on mathematical models while ignoring the data that fed them. Dr. Fei-Fei Li, then an assistant professor at UIUC and later Princeton/Stanford, recognized that vision algorithms could not generalize without seeing the visual complexity of the real world. Despite skepticism and rejected grant proposals, she led a team that indexed and annotated 14 million images into ImageNet. When launched in 2009, it catalyzed the deep learning revolution. Breakthroughs require relentless, unglamorous groundwork before recognition arrives.',
      supportedLanguages: ['en', 'hi', 'hinglish'],
      verificationStatus: 'VERIFIED',
      sources: [
        {
          sourceName: 'The Worlds I See: Curiosity, Exploration, and Discovery at the Dawn of AI (Flatiron Books, 2023)',
          sourceUrl: 'https://us.macmillan.com/books/9781250897930/theworldsisee',
          sourceType: 'BIOGRAPHY',
        },
        {
          sourceName: 'ImageNet: A Large-Scale Hierarchical Image Database (IEEE CVPR 2009)',
          sourceUrl: 'https://ieeexplore.ieee.org/document/5206848',
          sourceType: 'ACADEMIC_PAPER',
        },
      ],
    },
    {
      title: 'Satya Nadella and the Learn-It-All Culture',
      subject: 'Satya Nadella',
      careerCategory: 'Leadership & Entrepreneurship',
      summary: 'How shifting from a "know-it-all" to a "learn-it-all" mindset rebuilt Microsoft into an adaptive ecosystem.',
      fullContent: 'When Satya Nadella stepped into the chief executive role at Microsoft in 2014, the organization was mired in internal fiefdoms and stagnating platforms. Drawing upon Dr. Carol Dweck’s research on psychological mindsets, Nadella articulated a simple operational doctrine: "The learn-it-all will always do better than the know-it-all." He replaced defensive posture with curiosity and continuous upskilling. Rather than feeling intimidated by unfinished tasks or new concepts, adopt the learner stance: spend 20 minutes understanding what you did not understand yesterday.',
      supportedLanguages: ['en', 'hi', 'hinglish'],
      verificationStatus: 'VERIFIED',
      sources: [
        {
          sourceName: 'Hit Refresh: The Quest to Rediscover Microsoft’s Soul (HarperBusiness, 2017)',
          sourceUrl: 'https://www.harpercollins.com/products/hit-refresh-satya-nadella',
          sourceType: 'BOOK',
        },
      ],
    },
    {
      title: 'Dr. Cal Newport on Attention Residue',
      subject: 'Dr. Cal Newport',
      careerCategory: 'Personal Development & Productivity',
      summary: 'Scientific evidence on why switching between social feeds and analytical tasks degrades cognitive power.',
      fullContent: 'Dr. Cal Newport, professor of computer science at Georgetown University, synthesized cognitive research from Sophie Leroy demonstrating "attention residue." When you check an Instagram notification for just thirty seconds while writing code, your attention does not switch back cleanly. A portion of your working memory remains stuck evaluating the social stimulus. Working in singular, uninterrupted 25-minute blocks produces dramatically higher quality solutions in less calendar time.',
      supportedLanguages: ['en', 'hi', 'hinglish'],
      verificationStatus: 'VERIFIED',
      sources: [
        {
          sourceName: 'Deep Work: Rules for Focused Success in a Distracted World (Grand Central Publishing, 2016)',
          sourceUrl: 'https://calnewport.com/deep-work/',
          sourceType: 'BOOK',
        },
        {
          sourceName: 'Why Is It So Hard to Do My Work? The Challenge of Attention Residue (Leroy, 2009)',
          sourceUrl: 'https://doi.org/10.1016/j.obhdp.2009.04.002',
          sourceType: 'ACADEMIC_PAPER',
        },
      ],
    },
  ];

  for (const s of storiesData) {
    const { sources, ...storyFields } = s;
    const story = await prisma.motivationalStory.create({
      data: {
        ...storyFields,
        sources: {
          create: sources,
        },
      },
    });
    console.log(`Created story: ${story.title}`);
  }

  // 2. Create Demo User
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('password123', salt);

  const user = await prisma.user.create({
    data: {
      email: 'alex@lifeos.dev',
      passwordHash,
      displayName: 'Alex Rivera',
      preferredLanguage: 'en',
      careerCategory: 'Software Engineering',
      communicationStyle: 'FRIENDLY_FRIEND',
      preference: {
        create: {
          deliveryMode: 'SMART_COMPANION',
          voiceAssistantEnabled: true,
          voiceRemindersEnabled: true,
          spokenStoriesEnabled: false,
          speakingRate: 1.0,
          notificationSoundEnabled: true,
          quietHoursStart: '22:00',
          quietHoursEnd: '07:00',
          timeZone: 'UTC',
          reminderFrequencyLimit: 30,
        },
      },
      goals: {
        create: [
          {
            title: 'Solve two DSA questions on Trees & Graphs',
            description: 'Binary Tree Level Order Traversal & Course Schedule',
            category: 'Career',
            targetValue: 2,
            targetUnit: 'questions',
            priority: 'HIGH',
            schedule: 'DAILY',
            isActive: true,
            completions: {
              create: [
                {
                  completionDate: new Date().toISOString().split('T')[0],
                  completedValue: 1,
                  isCompleted: false,
                },
              ],
            },
          },
          {
            title: 'Code LIFEOS Android Bridge in Kotlin',
            description: 'Implement UsageStatsManager foreground estimation module',
            category: 'Career',
            targetValue: 60,
            targetUnit: 'minutes',
            priority: 'HIGH',
            schedule: 'DAILY',
            isActive: true,
          },
          {
            title: 'Practice Spoken English & Technical Articulation',
            description: 'Record 1 mock system architecture explanation',
            category: 'Personal Development',
            targetValue: 20,
            targetUnit: 'minutes',
            priority: 'MEDIUM',
            schedule: 'DAILY',
            isActive: true,
          },
        ],
      },
      monitoredApps: {
        create: [
          {
            packageName: 'com.instagram.android',
            displayName: 'Instagram',
            dailyLimitMinutes: 45,
            thresholds: {
              create: [
                { thresholdMinutes: 20, reminderMode: 'TEXT_ONLY', storyEnabled: true, voiceEnabled: false },
                { thresholdMinutes: 40, reminderMode: 'VOICE_AND_TEXT', storyEnabled: true, voiceEnabled: true },
                { thresholdMinutes: 60, reminderMode: 'SMART_COMPANION', storyEnabled: true, voiceEnabled: true },
              ],
            },
          },
          {
            packageName: 'com.google.android.youtube',
            displayName: 'YouTube',
            dailyLimitMinutes: 60,
            thresholds: {
              create: [
                { thresholdMinutes: 30, reminderMode: 'TEXT_ONLY', storyEnabled: true, voiceEnabled: false },
                { thresholdMinutes: 60, reminderMode: 'VOICE_AND_TEXT', storyEnabled: true, voiceEnabled: true },
              ],
            },
          },
        ],
      },
      devices: {
        create: [
          {
            platform: 'ANDROID',
            deviceName: 'Pixel 8 Pro (Dev)',
          },
        ],
      },
    },
  });

  // Attach a device usage summary for today
  const device = await prisma.device.findFirst({ where: { userId: user.id } });
  if (device) {
    const today = new Date().toISOString().split('T')[0];
    await prisma.appUsageSummary.createMany({
      data: [
        {
          deviceId: device.id,
          packageName: 'com.instagram.android',
          usageDate: today,
          durationMinutes: 35,
        },
        {
          deviceId: device.id,
          packageName: 'com.google.android.youtube',
          usageDate: today,
          durationMinutes: 22,
        },
      ],
    });
  }

  // Create a focus session
  await prisma.focusSession.create({
    data: {
      userId: user.id,
      durationSeconds: 1500,
      actualDurationSeconds: 1500,
      status: 'COMPLETED',
      startedAt: new Date(Date.now() - 3600 * 1000 * 2),
      completedAt: new Date(Date.now() - 3600 * 1000 * 2 + 1500 * 1000),
    },
  });

  console.log(`Seeded user ${user.displayName} (${user.email}) successfully!`);
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
