/**
 * CI dataset - contains additional test cases for pre-deployment testing.
 * Used before deployment to ensure the app works correctly.
 * Size: 50-200 questions
 */
export const ciData = [
  // Additional Basic Questions
  {
    input: "Who won the 2024 Open Championship?",
    expected: "Shane Lowry won the 2024 Open Championship at Royal Troon Golf Club.",
  },
  {
    input: "What is the current world ranking of Jon Rahm?",
    expected: "Jon Rahm is currently ranked #3 in the Official World Golf Ranking.",
  },
  {
    input: "Who won the 2024 Players Championship?",
    expected: "Scottie Scheffler won the 2024 Players Championship at TPC Sawgrass.",
  },
  {
    input: "What is the total purse for the 2024 Masters Tournament?",
    expected: "The 2024 Masters Tournament had a total purse of $20 million, with the winner receiving $3.6 million.",
  },
  {
    input: "Who is the defending champion of the US Open?",
    expected: "Wyndham Clark is the defending champion of the US Open, having won in 2023 at Los Angeles Country Club.",
  },
  {
    input: "What is the current world ranking of Viktor Hovland?",
    expected: "Viktor Hovland is currently ranked #4 in the Official World Golf Ranking.",
  },
  {
    input: "Who won the 2024 Arnold Palmer Invitational?",
    expected: "Scottie Scheffler won the 2024 Arnold Palmer Invitational at Bay Hill Club & Lodge.",
  },
  {
    input: "What is the current world ranking of Xander Schauffele?",
    expected: "Xander Schauffele is currently ranked #5 in the Official World Golf Ranking.",
  },
  {
    input: "Who won the 2024 Memorial Tournament?",
    expected: "Viktor Hovland won the 2024 Memorial Tournament at Muirfield Village Golf Club.",
  },
  {
    input: "What is the current world ranking of Ludvig Åberg?",
    expected: "Ludvig Åberg is currently ranked #6 in the Official World Golf Ranking.",
  },
  
  // Additional Multi-hop Questions
  {
    input: "Which player has the longest average driving distance on the PGA Tour this season, and how does their accuracy compare to the tour average?",
    expected: "Rory McIlroy has the longest average driving distance on the PGA Tour this season at approximately 320 yards. However, his driving accuracy is around 60%, which is slightly below the tour average of 62%, showing the trade-off between distance and accuracy.",
  },
  {
    input: "Compare the putting statistics of the top 5 players in the world rankings and identify which one has the best strokes gained putting this season.",
    expected: "Among the top 5 players in the world rankings (Scheffler, McIlroy, Rahm, Hovland, Schauffele), Rory McIlroy has the best strokes gained putting this season, ranking in the top 20 on the PGA Tour in this category, while others rank lower in putting performance.",
  },
  {
    input: "Which player has the most top-10 finishes in major championships over the last 3 years, and how does this compare to their overall tournament win rate?",
    expected: "Rory McIlroy has the most top-10 finishes in major championships over the last 3 years with 8 finishes. His overall tournament win rate during this period is approximately 15%, showing consistency in major championships even when not winning.",
  },
  {
    input: "What is the average age of the top 10 players in the world rankings, and how does this compare to the average age of major championship winners in the last 5 years?",
    expected: "The average age of the top 10 players in the world rankings is approximately 29 years old. The average age of major championship winners in the last 5 years is approximately 31 years old, showing that experience is still valuable in major championships.",
  },
  {
    input: "Which player has the best scoring average in the final round of tournaments this season, and how does this compare to their first round scoring average?",
    expected: "Scottie Scheffler has the best scoring average in the final round of tournaments this season at approximately 68.2. His first round scoring average is around 69.5, showing his ability to perform under pressure and improve as tournaments progress.",
  },
]; 