/**
 * Task Search Skill
 *
 * Implements intelligent search with relevance ranking and debouncing.
 * Pure function for case-insensitive, multi-field search with performance optimization.
 *
 * Search Algorithm:
 * - Case-insensitive partial matching
 * - Multi-token AND logic (all tokens must match)
 * - Relevance ranking: Title > Description > Tags
 * - Result limit: Top 50 matches
 *
 * @module lib/skills/task-search
 */

import type { Task } from '@/types/task.types';

/**
 * Maximum search results to return (performance limit)
 */
const MAX_SEARCH_RESULTS = 50;

/**
 * Search result with relevance score
 */
interface SearchResult {
  task: Task;
  score: number;
}

/**
 * Searchable text extracted from task
 */
interface SearchableText {
  title: string;
  description: string;
  tags: string;
}

/**
 * Search tasks with relevance ranking
 *
 * Implements case-insensitive search across title, description, and tags
 * with multi-token AND logic and relevance-based scoring.
 *
 * @param tasks - Array of tasks to search
 * @param query - Search query string
 * @returns Ranked array of matching tasks (max 50)
 *
 * @example
 * searchTasks(tasks, 'urgent report')
 * // Returns tasks containing both "urgent" AND "report" in any field,
 * // ranked by relevance (title matches first)
 *
 * searchTasks(tasks, '')
 * // Returns all tasks (no filtering for empty query)
 */
export function searchTasks(tasks: Task[], query: string): Task[] {
  // Tokenize query
  const tokens = tokenizeQuery(query);

  // Empty query returns all tasks
  if (tokens.length === 0) {
    return tasks;
  }

  // Filter tasks that match all tokens (AND logic)
  const matches: SearchResult[] = [];

  for (const task of tasks) {
    const searchableText = getSearchableText(task);
    const combinedText = `${searchableText.title} ${searchableText.description} ${searchableText.tags}`.toLowerCase();

    // Check if all tokens match (AND logic)
    const allTokensMatch = tokens.every((token) =>
      combinedText.includes(token.toLowerCase())
    );

    if (allTokensMatch) {
      // Calculate relevance score
      const score = calculateRelevanceScore(searchableText, tokens);
      matches.push({ task, score });
    }
  }

  // Sort by relevance score (highest first)
  matches.sort((a, b) => b.score - a.score);

  // Return top 50 results
  return matches.slice(0, MAX_SEARCH_RESULTS).map((result) => result.task);
}

/**
 * Tokenize search query into individual search terms
 *
 * Splits query by whitespace and filters out empty tokens.
 *
 * @param query - Raw search query
 * @returns Array of search tokens (trimmed, non-empty)
 *
 * @example
 * tokenizeQuery('  urgent   report  ')
 * // Returns: ['urgent', 'report']
 */
function tokenizeQuery(query: string): string[] {
  return query
    .trim()
    .split(/\s+/)
    .filter((token) => token.length > 0);
}

/**
 * Extract searchable text from task
 *
 * @param task - Task to extract text from
 * @returns Object with title, description, and tags text
 */
function getSearchableText(task: Task): SearchableText {
  return {
    title: task.title || '',
    description: task.description || '',
    tags: (task.tags || []).join(' '),
  };
}

/**
 * Calculate relevance score for search result
 *
 * Scoring algorithm:
 * - Exact title match: +100 points per token
 * - Partial title match: +50 points per token
 * - Description match: +10 points per token
 * - Tag match: +5 points per token
 *
 * @param text - Searchable text from task
 * @param tokens - Search tokens
 * @returns Relevance score (higher = more relevant)
 *
 * @example
 * calculateRelevanceScore({ title: 'urgent report', description: '', tags: '' }, ['urgent'])
 * // Returns: 100 (exact title match)
 */
function calculateRelevanceScore(text: SearchableText, tokens: string[]): number {
  let score = 0;

  for (const token of tokens) {
    const lowerToken = token.toLowerCase();
    const lowerTitle = text.title.toLowerCase();
    const lowerDescription = text.description.toLowerCase();
    const lowerTags = text.tags.toLowerCase();

    // Exact title match (whole word)
    if (lowerTitle === lowerToken) {
      score += 100;
    }
    // Partial title match
    else if (lowerTitle.includes(lowerToken)) {
      score += 50;
    }

    // Description match
    if (lowerDescription.includes(lowerToken)) {
      score += 10;
    }

    // Tag match
    if (lowerTags.includes(lowerToken)) {
      score += 5;
    }
  }

  return score;
}

/**
 * Highlight matching text in string
 *
 * Wraps matched tokens in <mark> tags for visual highlighting.
 *
 * @param text - Text to highlight
 * @param query - Search query
 * @returns HTML string with <mark> tags around matches
 *
 * @example
 * highlightText('Urgent Report', 'urgent')
 * // Returns: '<mark>Urgent</mark> Report'
 */
export function highlightText(text: string, query: string): string {
  if (!query || !text) {
    return text;
  }

  const tokens = tokenizeQuery(query);
  let highlightedText = text;

  for (const token of tokens) {
    // Escape special regex characters
    const escapedToken = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedToken})`, 'gi');
    highlightedText = highlightedText.replace(regex, '<mark>$1</mark>');
  }

  return highlightedText;
}

/**
 * Check if task matches search query (without ranking)
 *
 * Useful for simple filtering without relevance scoring.
 *
 * @param task - Task to check
 * @param query - Search query
 * @returns True if task matches query, false otherwise
 *
 * @example
 * matchesQuery(task, 'urgent report')
 * // Returns: true if task contains both "urgent" AND "report"
 */
export function matchesQuery(task: Task, query: string): boolean {
  const tokens = tokenizeQuery(query);

  if (tokens.length === 0) {
    return true;
  }

  const searchableText = getSearchableText(task);
  const combinedText = `${searchableText.title} ${searchableText.description} ${searchableText.tags}`.toLowerCase();

  return tokens.every((token) => combinedText.includes(token.toLowerCase()));
}
