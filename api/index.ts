// Vercel serverless entry point — re-exports the Express app.
// Vercel calls this as a function: handler(req, res).
// All /api/* requests are rewritten here by vercel.json.
export { default } from '../server';
