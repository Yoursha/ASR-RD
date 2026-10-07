import { pinyin } from 'pinyin-pro';

/**
 * Tone Information mapping for Mandarin Chinese
 */
export const TONE_MAP = {
  1: { name: '1st Tone (阴平)', mark: '¯', contour: '55 (High Level)', pitchTip: 'Keep your voice pitch high and flat, like singing a sustained high note.' },
  2: { name: '2nd Tone (阳平)', mark: 'ˊ', contour: '35 (Rising)', pitchTip: 'Raise your voice pitch smoothly from middle to high, like asking "What?".' },
  3: { name: '3rd Tone (上声)', mark: 'ˇ', contour: '214 (Dipping)', pitchTip: 'Dip your pitch down low first before letting it rise slightly at the end.' },
  4: { name: '4th Tone (去声)', mark: 'ˋ', contour: '51 (Falling)', pitchTip: 'Drop your pitch sharply and forcefully from high to low.' },
  5: { name: 'Neutral Tone (轻声)', mark: '·', contour: 'Short', pitchTip: 'Pronounce lightly and briefly without emphasis.' }
};

/**
 * Normalizes Chinese text by stripping common punctuation for comparison
 */
export function normalizeChineseText(text) {
  if (!text) return '';
  return text.replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, '');
}

/**
 * Extract comprehensive Pinyin and Tone details for a Chinese character
 */
export function getCharToneDetails(char) {
  if (!char || !/[\u4e00-\u9fa5]/.test(char)) {
    return {
      char,
      pinyinSymbol: '',
      pinyinNum: '',
      baseSyllable: '',
      toneNum: 5,
      toneInfo: TONE_MAP[5]
    };
  }

  try {
    const symbol = pinyin(char, { toneType: 'symbol' });
    const numPinyin = pinyin(char, { toneType: 'num' });

    // Extract tone number (1-5) from end of numPinyin string e.g. "xiang3" -> 3
    const match = numPinyin.match(/^([a-z]+)(\d)?$/i);
    let baseSyllable = numPinyin;
    let toneNum = 5;

    if (match) {
      baseSyllable = match[1].toLowerCase();
      toneNum = match[2] ? parseInt(match[2], 10) : 5;
    }

    return {
      char,
      pinyinSymbol: symbol,
      pinyinNum: numPinyin,
      baseSyllable,
      toneNum,
      toneInfo: TONE_MAP[toneNum] || TONE_MAP[5]
    };
  } catch (e) {
    return {
      char,
      pinyinSymbol: char,
      pinyinNum: char,
      baseSyllable: char,
      toneNum: 5,
      toneInfo: TONE_MAP[5]
    };
  }
}

/**
 * Computes Chinese Pinyin array for full text string
 */
export function getSentencePinyin(text) {
  if (!text) return [];
  const cleanChars = Array.from(text);
  return cleanChars.map(char => {
    if (/[\u4e00-\u9fa5]/.test(char)) {
      try {
        return pinyin(char, { toneType: 'symbol' });
      } catch (e) {
        return char;
      }
    }
    return char;
  });
}

/**
 * Character-level dynamic programming alignment algorithm with Intonation & Tone Mistake Detection
 */
export function compareSentences(targetText, asrText) {
  const targetChars = Array.from(targetText || '');
  const rawAsrChars = Array.from(asrText || '');

  const normTarget = targetChars.map(c => normalizeChineseText(c));
  const normAsr = rawAsrChars.map(c => normalizeChineseText(c));

  const n = targetChars.length;
  const m = rawAsrChars.length;

  const dp = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));

  for (let i = 0; i <= n; i++) dp[i][0] = i;
  for (let j = 0; j <= m; j++) dp[0][j] = j;

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const charA = normTarget[i - 1];
      const charB = normAsr[j - 1];
      const isMatch = (charA === charB) || (targetChars[i - 1] === rawAsrChars[j - 1]);

      if (isMatch) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(
          dp[i - 1][j],
          dp[i][j - 1],
          dp[i - 1][j - 1]
        );
      }
    }
  }

  // Backtracking alignment
  let i = n;
  let j = m;
  const alignedTarget = [];
  const alignedAsr = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0) {
      const charA = normTarget[i - 1];
      const charB = normAsr[j - 1];
      const isMatch = (charA === charB) || (targetChars[i - 1] === rawAsrChars[j - 1]);

      if (isMatch) {
        const targetDetails = getCharToneDetails(targetChars[i - 1]);
        alignedTarget.unshift({
          char: targetChars[i - 1],
          pinyin: targetDetails.pinyinSymbol,
          toneDetails: targetDetails,
          status: 'correct',
          spoken: rawAsrChars[j - 1],
          errorType: null
        });
        i--;
        j--;
        continue;
      }

      const minVal = Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      if (dp[i - 1][j - 1] === minVal) {
        const targetDetails = getCharToneDetails(targetChars[i - 1]);
        const spokenDetails = getCharToneDetails(rawAsrChars[j - 1]);

        // INTONATION / TONE MISTAKE ANALYSIS
        const isToneMistake = (targetDetails.baseSyllable === spokenDetails.baseSyllable) &&
                              (targetDetails.toneNum !== spokenDetails.toneNum);

        alignedTarget.unshift({
          char: targetChars[i - 1],
          pinyin: targetDetails.pinyinSymbol,
          toneDetails: targetDetails,
          spokenToneDetails: spokenDetails,
          status: 'wrong',
          spoken: rawAsrChars[j - 1],
          spokenPinyin: spokenDetails.pinyinSymbol,
          errorType: isToneMistake ? 'intonation_mistake' : 'phoneme_mistake',
          toneMistakeInfo: isToneMistake ? {
            expectedTone: targetDetails.toneNum,
            spokenTone: spokenDetails.toneNum,
            expectedMark: targetDetails.toneInfo.mark,
            spokenMark: spokenDetails.toneInfo.mark,
            pitchTip: targetDetails.toneInfo.pitchTip
          } : null
        });
        i--;
        j--;
        continue;
      }
    }

    if (i > 0 && (j === 0 || dp[i - 1][j] + 1 === dp[i][j])) {
      const targetDetails = getCharToneDetails(targetChars[i - 1]);
      alignedTarget.unshift({
        char: targetChars[i - 1],
        pinyin: targetDetails.pinyinSymbol,
        toneDetails: targetDetails,
        status: 'missing',
        spoken: null,
        errorType: 'missing'
      });
      i--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] + 1 === dp[i][j])) {
      const spokenDetails = getCharToneDetails(rawAsrChars[j - 1]);
      alignedAsr.unshift({
        char: rawAsrChars[j - 1],
        pinyin: spokenDetails.pinyinSymbol,
        toneDetails: spokenDetails,
        status: 'extra',
        errorType: 'extra'
      });
      j--;
    } else {
      i--;
      j--;
    }
  }

  // Calculate statistics & Intonation specific scores
  let correctCount = 0;
  let intonationErrorCount = 0;
  let phonemeErrorCount = 0;
  let missingCount = 0;
  let totalTargetPunctuationRemoved = 0;

  alignedTarget.forEach(item => {
    const isPunct = /^[^\u4e00-\u9fa5a-zA-Z0-9]$/.test(item.char);
    if (isPunct) {
      totalTargetPunctuationRemoved++;
    } else if (item.status === 'correct') {
      correctCount++;
    } else if (item.errorType === 'intonation_mistake') {
      intonationErrorCount++;
    } else if (item.errorType === 'phoneme_mistake') {
      phonemeErrorCount++;
    } else if (item.errorType === 'missing') {
      missingCount++;
    }
  });

  const totalMeaningfulChars = Math.max(1, targetChars.length - totalTargetPunctuationRemoved);
  const accuracyScore = Math.round((correctCount / totalMeaningfulChars) * 100);

  // Intonation Score (percentage of characters with correct pitch intonation)
  const intonationScore = Math.max(0, Math.round(((totalMeaningfulChars - intonationErrorCount - missingCount) / totalMeaningfulChars) * 100));

  return {
    alignedTarget,
    extraSpoken: alignedAsr,
    accuracyScore,
    intonationScore,
    correctCount,
    intonationErrorCount,
    phonemeErrorCount,
    missingCount,
    totalChars: totalMeaningfulChars,
    rawAsrText: asrText,
    targetText
  };
}
