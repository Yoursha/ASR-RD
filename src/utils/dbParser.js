/**
 * Utility to fetch and parse Chinese sentences from db.txt
 */

export async function fetchSentencesFromDB() {
  try {
    const baseUrl = import.meta.env.BASE_URL || './';
    const dbUrl = baseUrl.endsWith('/') ? `${baseUrl}db.txt` : `${baseUrl}/db.txt`;
    const response = await fetch(dbUrl);
    if (!response.ok) {
      throw new Error(`Failed to load db.txt from ${dbUrl}: ${response.statusText}`);
    }
    const text = await response.text();
    return parseDBContent(text);
  } catch (error) {
    console.warn('Could not fetch db.txt, fallback to default set:', error);
    return getDefaultSentences();
  }
}

export function parseDBContent(dbText) {
  const lines = dbText.split(/\r?\n/).map(l => l.trim()).filter(l => l && !l.startsWith('#'));
  const sentences = [];

  lines.forEach((line, index) => {
    let category = 'General';
    let targetText = line;
    let translation = '';

    // Check for category pattern [Category]
    const categoryMatch = line.match(/^\[(.*?)\]\s*(.*)$/);
    if (categoryMatch) {
      category = categoryMatch[1];
      targetText = categoryMatch[2];
    }

    // Check for translation separator |
    if (targetText.includes('|')) {
      const parts = targetText.split('|');
      targetText = parts[0].trim();
      translation = parts[1].trim();
    }

    if (targetText) {
      sentences.push({
        id: `db-${index + 1}`,
        category,
        targetText,
        translation: translation || 'Practicing Chinese Speaking',
        source: 'db.txt'
      });
    }
  });

  return sentences.length > 0 ? sentences : getDefaultSentences();
}

export function getDefaultSentences() {
  return [
    {
      id: 'default-1',
      category: 'Greetings',
      targetText: '你好，很高兴认识你。',
      translation: 'Hello, nice to meet you.',
      source: 'default'
    },
    {
      id: 'default-2',
      category: 'Daily',
      targetText: '今天天气非常好，阳光明媚。',
      translation: 'The weather is very nice today, bright and sunny.',
      source: 'default'
    },
    {
      id: 'default-3',
      category: 'Daily',
      targetText: '我正在学习汉语口语发音。',
      translation: 'I am currently learning Chinese spoken pronunciation.',
      source: 'default'
    },
    {
      id: 'default-4',
      category: 'Food',
      targetText: '请问这个菜辣不辣？',
      translation: 'Excuse me, is this dish spicy?',
      source: 'default'
    },
    {
      id: 'default-5',
      category: 'Travel',
      targetText: '请问去地铁站怎么走？',
      translation: 'Excuse me, how do I get to the subway station?',
      source: 'default'
    }
  ];
}
