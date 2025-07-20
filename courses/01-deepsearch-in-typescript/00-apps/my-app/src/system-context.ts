/**
 * Types for search and scrape results
 */
type QueryResultSearchResult = {
  date: string;
  title: string;
  url: string;
  snippet: string;
};

type QueryResult = {
  query: string;
  results: QueryResultSearchResult[];
};

type ScrapeResult = {
  url: string;
  result: string;
};

/**
 * SystemContext manages the state of the agent loop and provides
 * formatted context for the LLM to make decisions.
 */
export class SystemContext {
  /**
   * The current step in the loop
   */
  private step = 0;

  /**
   * The history of all queries searched
   */
  private queryHistory: QueryResult[] = [];

  /**
   * The history of all URLs scraped
   */
  private scrapeHistory: ScrapeResult[] = [];

  /**
   * Determines if the loop should stop based on step count
   */
  shouldStop(): boolean {
    return this.step >= 10;
  }

  /**
   * Reports the results of search queries
   */
  reportQueries(queries: QueryResult[]): void {
    this.queryHistory.push(...queries);
  }

  /**
   * Reports the results of page scrapes
   */
  reportScrapes(scrapes: ScrapeResult[]): void {
    this.scrapeHistory.push(...scrapes);
  }

  /**
   * Increments the step counter
   */
  incrementStep(): void {
    this.step++;
  }

  /**
   * Gets the current step number
   */
  getStep(): number {
    return this.step;
  }

  /**
   * Formats a single query result for LLM consumption
   */
  private toQueryResult = (query: QueryResultSearchResult): string => {
    return [
      `### ${query.date} - ${query.title}`,
      query.url,
      query.snippet,
    ].join("\n\n");
  };

  /**
   * Returns the query history formatted for the LLM
   */
  getQueryHistory(): string {
    return this.queryHistory
      .map((query) =>
        [
          `## Query: "${query.query}"`,
          ...query.results.map(this.toQueryResult),
        ].join("\n\n"),
      )
      .join("\n\n");
  }

  /**
   * Returns the scrape history formatted for the LLM
   */
  getScrapeHistory(): string {
    return this.scrapeHistory
      .map((scrape) =>
        [
          `## Scrape: "${scrape.url}"`,
          `<scrape_result>`,
          scrape.result,
          `</scrape_result>`,
        ].join("\n\n"),
      )
      .join("\n\n");
  }

  /**
   * Returns the complete context formatted for the LLM
   */
  getContext(): string {
    const queryHistory = this.getQueryHistory();
    const scrapeHistory = this.getScrapeHistory();
    
    const parts = [];
    
    if (queryHistory) {
      parts.push("## Search History", queryHistory);
    }
    
    if (scrapeHistory) {
      parts.push("## Scrape History", scrapeHistory);
    }
    
    return parts.join("\n\n");
  }

  /**
   * Returns the current step information
   */
  getStepInfo(): string {
    return `Current step: ${this.step}/10`;
  }
} 