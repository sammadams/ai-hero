/**
 * Development dataset - contains the most challenging test cases.
 * Used during development for local testing of toughest cases.
 * Size: 10-20 questions
 */
export const devData = [
  // Basic Questions - Recent Knowledge
  {
    input: "Who won the 2024 Masters Tournament?",
    expected: "Scottie Scheffler",
  },
  {
    input: "What is the current world ranking of Rory McIlroy?",
    expected: "Rory McIlroy is currently ranked #2.",
  },
  {
    input: "Who won the 2024 PGA Championship?",
    expected: "Xander Schauffele",
  },
  {
    input: "What is the prize money for winning the 2024 US Open?",
    expected: "There was a total purse of $21.5 million, with the winner receiving $4.3 million.",
  },
  {
    input: "Who is the current FedEx Cup leader?",
    expected: "Scottie Scheffler",
  },
  
  // Multi-hop Questions - Complex Reasoning
  {
    input: "Which player has won the most major championships in the last 5 years, and how does their total career majors compare to Tiger Woods?",
    expected: "Jon Rahm has won 2 major championships in the last 5 years (2021 US Open, 2023 Masters), which is the most in that period. Rahm has 2 career majors compared to Tiger Woods' 15 career majors, making Woods the clear leader in career major championships.",
  },
  {
    input: "Compare the average driving distance of the top 3 players in the 2024 FedEx Cup standings and identify which one has the most accurate approach shots from 150-175 yards.",
    expected: "The top 3 players in the 2024 FedEx Cup standings are Scottie Scheffler, Xander Schauffele, and Rory McIlroy. Scheffler averages around 310 yards driving distance, Schauffele around 305 yards, and McIlroy around 320 yards. Among these three, Scottie Scheffler has the most accurate approach shots from 150-175 yards, ranking in the top 10 on the PGA Tour in this category.",
  },
  {
    input: "Which player has the best scoring average on par-3 holes this season, and how does their performance on par-3s compare to their overall scoring average?",
    expected: "Scottie Scheffler has the best scoring average on par-3 holes this season at approximately 2.95. His par-3 scoring average is significantly better than his overall scoring average of around 68.5, showing his exceptional short game and putting performance.",
  },
  {
    input: "Who won the most tournaments in the 2023-24 PGA Tour season, and how many of those wins came in playoff situations versus wire-to-wire victories?",
    expected: "Scottie Scheffler won the most tournaments in the 2023-24 PGA Tour season with 6 victories. Among these wins, 2 came in playoff situations (The Players Championship and the RBC Heritage), while 4 were wire-to-wire or comfortable victories, demonstrating his dominance throughout the season.",
  },
  {
    input: "Which player has the highest percentage of greens in regulation on the PGA Tour this season, and how does their putting average rank compared to other top players?",
    expected: "Scottie Scheffler leads the PGA Tour in greens in regulation percentage at approximately 75%. However, his putting average ranks around 50th on tour, showing that while he hits many greens, his putting performance is not as strong as his ball-striking, which is why he's been working on his putting technique.",
  },
]; 