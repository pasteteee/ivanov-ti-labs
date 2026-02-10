# How the algorithms work (and behaviour for different input lengths)

## Preprocessing: normalization

Before encryption/decryption, the text is **normalized**: only letters from the allowed alphabet are kept (English A–Z for the grille, Russian А–Я for Vigenère). All other characters (spaces, digits, punctuation) are **dropped**. So the length that reaches the algorithm is the number of allowed letters only.

---

## 1. Rotating grille (4×4)

### Idea

- The **grille** is a 4×4 boolean matrix: `true` = hole, `false` = no hole. Exactly 4 holes.
- **Encryption**: we have a sequence of 16 positions (write order). It is built by:
  1. Taking the 4 hole positions, sorting them **top-to-bottom** (by row, then column).
  2. Rotating the grille 90° clockwise and again taking the 4 new hole positions, again sorted top-to-bottom.
  3. Repeating until we have 16 positions (4 rotations × 4 holes).
- We fill the 4×4 grid by putting the 1st letter at the 1st position, 2nd at 2nd, …, 16th at 16th.
- **Output** is read **row by row**: (0,0), (0,1), (0,2), (0,3), (1,0), …, (3,3). So the ciphertext is always 16 characters per “block”.

### Block size and padding

- The algorithm works in **blocks of 16 characters** (one full 4×4 grid).
- **Length of normalized plaintext**:
  - **Multiple of 16** (16, 32, 48, …): no padding. Each block is encrypted as above. Output length = input length.
  - **Not a multiple of 16** (e.g. 10, 25): the **last block** is padded to 16 with the character **`X`**. So we encrypt 16, 32, … and the last block may be e.g. `HELLOWORLD` + `XXXXXX` → 16 symbols. Output length = `ceil(length/16) * 16`.

### Examples of input length

| Normalized length | Blocks     | Padding      | Ciphertext length |
|-------------------|------------|-------------|--------------------|
| 10                | 1          | +6 X        | 16                 |
| 16                | 1          | 0           | 16                 |
| 17                | 2          | +15 X       | 32                 |
| 32                | 2          | 0           | 32                 |
| 100               | 7          | +12 X       | 112                |

### Decryption

- Ciphertext is processed in **blocks of 16**.
- For each block we fill the 4×4 grid **row by row** from the ciphertext, then read the 16 symbols back in the **write order** (hole order) to get the plaintext block.
- If the original plaintext was padded with `X`, the decrypted string will end with those `X` characters. The application does not strip them automatically.

### Summary (grille)

- **Input**: normalized English letters only; length can be any positive integer.
- **Output length**: always a multiple of 16; if input length is not, padding with `X` is used.
- **Different lengths**: only the number of 16‑character blocks and the presence of padding in the last block change; the rule “fill by write order, read row by row” is the same for every block.

---

## 2. Vigenère with progressive key

### Idea

- There is an **alphabet** (e.g. Russian А–Я) and a **key** (word/phrase).
- **Key stream** is built **progressively**:  
  - First block of length `key.length`: the key itself.  
  - Next block: each key character shifted by +1 in the alphabet (e.g. КЛЮЧ → ЛМЯШ).  
  - Next: +2, then +3, etc.  
  So the stream has the same length as the (normalized) plaintext or ciphertext.
- **Encryption**: for position `i`, ciphertext[i] = table(plaintext[i], key_stream[i]) — classic Vigenère (sum of indices mod alphabet size).
- **Decryption**: for position `i`, plaintext[i] = inverse_table(ciphertext[i], key_stream[i]).

### No blocks: stream cipher

- There is **no block structure**. Each character is processed independently (with its own key stream letter).
- **Length of output** = **length of (normalized) input**. No padding.
- So:
  - 5 letters in → 5 letters out.  
  - 100 letters in → 100 letters out.

### Examples of input length

| Normalized length | Key stream length | Ciphertext length |
|-------------------|-------------------|--------------------|
| 1                 | 1                 | 1                  |
| 4                 | 4                 | 4                  |
| 10                | 10                | 10                 |
| 100               | 100               | 100                |

### Different lengths

- **Short text**: key stream is truncated to text length (only as many key letters as needed).
- **Long text**: key stream is extended by repeating the key with increasing shift (progressive key) until it reaches text length.
- The alphabet and the key are fixed; only the **number of symbols** changes. The formula (index sum mod n for encrypt, index difference mod n for decrypt) is the same for every position.

### Summary (Vigenère)

- **Input**: normalized Russian letters (and key); length can be any positive integer.
- **Output length**: always **equal** to input length (no padding, no blocks).
- **Different lengths**: behaviour is the same symbol-by-symbol; only the key stream is extended or truncated to match the text length.

---

## Comparison

| Aspect              | Grille (4×4)              | Vigenère (progressive key) |
|---------------------|---------------------------|-----------------------------|
| Block structure     | Yes, 16 symbols           | No (stream)                 |
| Output length       | Multiple of 16 (padding)  | Equals input length         |
| Padding             | Last block padded with X  | None                        |
| Dependence on length| Last block may be padded  | Linear, no padding          |
