import { pinyin } from 'pinyin-pro';

/**
 * Normalizes Chinese text by stripping common punctuation for comparison purposes
 */
export function normalizeChineseText(text) {
  if (!text) return '';
  return text.replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, '');
}

/**
 * Computes Chinese Pinyin array for a text string
 */
export function getSentencePinyin(text) {
  if (!text) return [];
  const cleanChars = Array.from(text);
  return cleanChars.map(char => {
    // If it's a Chinese character, get pinyin
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
 * Character-level dynamic programming alignment algorithm (Needleman-Wunsch variant)
 * Compares target sentence against ASR recognized text.
 */
export function compareSentences(targetText, asrText) {
  const targetChars = Array.from(targetText || '');
  const rawAsrChars = Array.from(asrText || '');

  // Normalized arrays for pure character comparison (ignoring punctuation differences)
  const normTarget = targetChars.map(c => normalizeChineseText(c));
  const normAsr = rawAsrChars.map(c => normalizeChineseText(c));

  const n = targetChars.length;
  const m = rawAsrChars.length;

  // DP matrix calculation
  // dp[i][j] stores min edit operations between target[0..i-1] and asr[0..j-1]
  const dp = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));

  for (let i = 0; i <= n; i++) dp[i][0] = i;
  for (let j = 0; j <= m; j++) dp[0][j] = j;

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const charA = normTarget[i - 1];
      const charB = normAsr[j - 1];

      // If both are punctuation or empty, cost is 0 if equal
      const isMatch = (charA === charB) || (targetChars[i - 1] === rawAsrChars[j - 1]);

      if (isMatch) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(
          dp[i - 1][j],     // Deletion (missing in ASR)
          dp[i][j - 1],     // Insertion (extra in ASR)
          dp[i - 1][j - 1]  // Substitution (mismatched/wrong)
        );
      }
    }
  }

  // Backtracking to find exact aligned elements
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
        alignedTarget.unshift({
          char: targetChars[i - 1],
          pinyin: getPinyinForSingleChar(targetChars[i - 1]),
          status: 'correct',
          spoken: rawAsrChars[j - 1]
        });
        i--;
        j--;
        continue;
      }

      const minVal = Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      if (dp[i - 1][j - 1] === minVal) {
        // Substitution / Wrong pronunciation
        alignedTarget.unshift({
          char: targetChars[i - 1],
          pinyin: getPinyinForSingleChar(targetChars[i - 1]),
          status: 'wrong',
          spoken: rawAsrChars[j - 1],
          spokenPinyin: getPinyinForSingleChar(rawAsrChars[j - 1])
        });
        i--;
        j--;
        continue;
      }
    }

    if (i > 0 && (j === 0 || dp[i - 1][j] + 1 === dp[i][j])) {
      // Deletion / Omitted character
      alignedTarget.unshift({
        char: targetChars[i - 1],
        pinyin: getPinyinForSingleChar(targetChars[i - 1]),
        status: 'missing',
        spoken: null
      });
      i--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] + 1 === dp[i][j])) {
      // Extra spoken character
      alignedAsr.unshift({
        char: rawAsrChars[j - 1],
        pinyin: getPinyinForSingleChar(rawAsrChars[j - 1]),
        status: 'extra'
      });
      j--;
    } else {
      i--;
      j--;
    }
  }

  // Calculate statistics
  let correctCount = 0;
  let totalTargetPunctuationRemoved = 0;

  alignedTarget.forEach(item => {
    const isPunct = /^[^\u4e00-\u9fa5a-zA-Z0-9]$/.test(item.char);
    if (isPunct) {
      totalTargetPunctuationRemoved++;
    } else if (item.status === 'correct') {
      correctCount++;
    }
  });

  const totalMeaningfulChars = Math.max(1, targetChars.length - totalTargetPunctuationRemoved);
  const accuracyScore = Math.round((correctCount / totalMeaningfulChars) * 100);

  return {
    alignedTarget,
    extraSpoken: alignedAsr,
    accuracyScore,
    correctCount,
    totalChars: totalMeaningfulChars,
    rawAsrText: asrText,
    targetText
  };
}

function getPinyinForSingleChar(char) {
  if (!char || !/[\u4e00-\u9fa5]/.test(char)) return '';
  try {
    return pinyin(char, { toneType: 'symbol' });
  } catch (e) {
    return '';
  }
}
