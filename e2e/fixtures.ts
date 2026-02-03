/**
 * Test data fixtures for E2E tests
 * Focus on behavior patterns rather than specific data values
 */

export const country1 = { name: "France", slug: "france" };
export const country2 = { name: "United Kingdom", slug: "uk" };

export const city1 = { name: "Paris", slug: "paris", country: country1 };
export const city2 = { name: "London", slug: "london", country: country2 };

export const service1 = { name: "Web Design", slug: "web-design" };
export const service2 = { name: "Plumbing", slug: "plumbing" };
